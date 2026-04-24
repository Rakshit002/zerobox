/**
 * Production-Grade Email Body Extraction
 * 
 * Handles:
 * - Complex MIME structures (multipart/alternative, multipart/mixed, nested parts)
 * - Base64URL decoding (Gmail API format)
 * - DOM-based HTML parsing with cheerio
 * - Intelligent junk removal (unsubscribe, footer, social icons, tracking)
 * - Smart content extraction (finds main message body)
 * - Email categorization (promotion, personal, updates, newsletter)
 * - Zero-width character and unicode cleaning
 * - HTML-to-text conversion with proper formatting
 * - Quality scoring and fallback strategy
 */

import { load } from "cheerio";
import { htmlToText } from "html-to-text";

/**
 * Decode base64url data (Gmail API format)
 * @param {string} data - Base64url encoded string
 * @returns {string} Decoded UTF-8 text
 */
function decodeBase64Url(data) {
  try {
    if (!data) return "";
    
    // Convert base64url to standard base64
    const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    
    // Decode and remove zero-width/hidden unicode characters
    let text = Buffer.from(base64, "base64").toString("utf8");
    
    // Remove zero-width characters, zero-width joiner, zero-width non-joiner, etc.
    text = text.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");
    
    // Remove other hidden characters
    text = text.replace(/[\u061C\u180E]/g, "");
    
    return text;
  } catch (error) {
    console.error("Base64URL decode error:", error.message);
    return "";
  }
}

/**
 * Junk section patterns - regex patterns for sections to remove entirely
 */
const JUNK_PATTERNS = {
  unsubscribe: /unsubscribe|manage\s+preferences|email\s+preferences|manage\s+emails|email\s+settings|update\s+preferences|opt.?out|click\s+here\s+to\s+unsubscribe/gi,
  footer: /^(footer|footer\s+.*|post\s+script|p\.s\.|ps\.|--$)/gim,
  copyright: /©.*\d{4}|all\s+rights\s+reserved|copyright|®|trademark/gi,
  address: /\b\d+\s+[a-z\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|circle|ct)\b/gim,
  social: /(?:twitter|facebook|linkedin|instagram|youtube|follow\s+us)/gi,
  help: /(?:help|contact\s+us|need\s+support|customer\s+service|contact\s+support)/gi,
  privacyPolicy: /privacy\s+policy|terms\s+of\s+service|terms\s+and\s+conditions|cookie\s+policy/gi,
};

/**
 * Detect email category based on content and subject
 * @param {string} subject
 * @param {string} body
 * @param {string} from
 * @returns {string} category - promotion | personal | updates | newsletter
 */
function detectEmailCategory(subject = "", body = "", from = "") {
  const lowerSubject = subject.toLowerCase();
  const lowerBody = body.toLowerCase();
  const lowerFrom = from.toLowerCase();

  // Marketing/Promotion indicators
  const promotionKeywords = [
    "save", "discount", "offer", "deal", "sale", "limited time", "exclusive",
    "coupon", "promo", "special offer", "hurry", "ends soon", "final call",
    "buy now", "shop", "order now", "limited stock"
  ];

  if (promotionKeywords.some(kw => lowerSubject.includes(kw) || lowerBody.includes(kw))) {
    return "promotion";
  }

  // Newsletter indicators
  if (lowerSubject.includes("newsletter") || lowerBody.includes("unsubscribe") ||
      lowerFrom.includes("newsletter") || lowerFrom.includes("noreply") ||
      lowerFrom.includes("no-reply")) {
    return "newsletter";
  }

  // Updates/notifications
  const updateKeywords = ["update", "notification", "alert", "verification", "confirm"];
  if (updateKeywords.some(kw => lowerSubject.includes(kw))) {
    return "updates";
  }

  // Default to personal
  return "personal";
}

/**
 * Remove junk sections from HTML using cheerio DOM manipulation
 * @param {object} $ - Cheerio instance
 * @returns {void} - Modifies DOM in place
 */
function removeJunkSections($) {
  // Remove all script, style, noscript, svg, meta, link tags completely
  $("script, style, noscript, svg, meta, link, head, [type='hidden']").remove();

  // Remove tracking/pixel images
  $("img").each((i, el) => {
    const $img = $(el);
    const width = parseInt($img.attr("width")) || 0;
    const height = parseInt($img.attr("height")) || 0;
    
    if ((width === 1 && height === 1) || (width === 0 || height === 0)) {
      $img.remove();
    }
  });

  // Remove Microsoft Office Word namespace and XML elements
  $("[xmlns], [encoding], [office\\:smarttags]").removeAttr("xmlns");
  $("o\\:p, v\\:imagedata, v\\:f, v\\:shapetype, w\\:rsidR").remove();

  // Remove elements with common tracking/junk classes
  const junkClasses = [
    "unsubscribe", "footer", "address", "privacy", "social-icons",
    "tracking", "invisible", "hidden", "mso-", "vml-", "office365"
  ];
  
  junkClasses.forEach(cls => {
    $(`[class*="${cls}"]`).remove();
  });

  // Remove inline styles that are only display:none or visibility:hidden
  $("[style*='display:none'], [style*='display: none']").remove();
  $("[style*='visibility:hidden'], [style*='visibility: hidden']").remove();

  // Remove common email wrapper/template divs that contain multiple sections
  $("div[class*='wrapper'], div[class*='template'], div[class*='container'][class*='email']").each((i, el) => {
    const $el = $(el);
    if ($el.children().length > 10 && $el.text().includes("unsubscribe")) {
      // This is likely a template wrapper - keep content but remove wrapper
      $el.replaceWith($el.html());
    }
  });
}

/**
 * Remove noise text from content
 * @param {string} text
 * @returns {string}
 */
function cleanNoise(text) {
  if (!text) return "";

  let cleaned = text;

  // Remove excessive whitespace lines
  cleaned = cleaned.replace(/\s*\n\s*\n\s*\n+/g, "\n\n");

  // Remove repeated text (common in footers)
  const lines = cleaned.split("\n");
  const uniqueLines = [];
  let lastLine = "";

  for (const line of lines) {
    if (line.trim() !== lastLine.trim()) {
      uniqueLines.push(line);
      lastLine = line;
    }
  }

  cleaned = uniqueLines.join("\n");

  // Remove sequences of same character (often tracking or formatting junk)
  cleaned = cleaned.replace(/([=\-_*#]){4,}/g, "");

  // Remove URLs that are obviously tracking
  const trackingDomains = [
    "click\\.email", "click\\.service", "track\\.", "pixel\\.email",
    "beacon\\.", "email-trace\\.com", "emailtracking\\.activecampaign"
  ];
  
  trackingDomains.forEach(domain => {
    cleaned = cleaned.replace(new RegExp(`https?://[^\\s]*${domain}[^\\s]*`, "gi"), "");
  });

  return cleaned.trim();
}

/**
 * Extract meaningful sections from HTML
 * Tries to identify main content area vs navigation/footer
 * @param {object} $ - Cheerio instance
 * @returns {string} Most likely main content area HTML
 */
function extractMainContent($) {
  // Try to find main content area using common selectors
  const mainSelectors = [
    "main",
    "[role='main']",
    "article",
    ".content",
    ".message",
    ".body",
    ".email-body",
  ];

  for (const selector of mainSelectors) {
    const $main = $(selector);
    if ($main.length > 0) {
      return $main.html() || "";
    }
  }

  // If no semantic container found, use body or return all
  return $("body").html() || $.html();
}

/**
 * Score HTML quality - how "clean" and "content-rich" it is
 * Used to decide if HTML extraction is worth it vs fallback to plain text
 * @param {string} html
 * @returns {number} Score 0-100
 */
function scoreHtmlQuality(html) {
  if (!html) return 0;

  let score = 50; // Base score

  // Positive indicators
  const hasHeadings = /<h[1-6]/i.test(html);
  const hasParagraphs = /<p/i.test(html);
  const hasLists = /<ul|<ol/i.test(html);
  const hasLinks = /<a\s+href/i.test(html);

  if (hasHeadings) score += 15;
  if (hasParagraphs) score += 15;
  if (hasLists) score += 10;
  if (hasLinks) score += 10;

  // Negative indicators
  const hasScripts = /<script/i.test(html);
  const hasTracking = /pixel|beacon|track|1x1/i.test(html);
  const hasFrames = /<iframe/i.test(html);
  const hasTables = /<table/i.test(html) && !/<td/i.test(html);

  if (hasScripts) score -= 20;
  if (hasTracking) score -= 15;
  if (hasFrames) score -= 15;
  if (hasTables) score -= 10;

  // Ratio checks
  const tagCount = (html.match(/<[^>]+>/g) || []).length;
  const textLength = html.replace(/<[^>]+>/g, "").length;
  
  if (tagCount > textLength * 2) {
    score -= 20; // Too much HTML, not enough content
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Recursively find best email body from MIME parts
 * @param {object} payload - Gmail message payload
 * @returns {object} { content, mimeType, quality } - Best available content
 */
function findBestMimePart(payload) {
  if (!payload) {
    return { content: "", mimeType: "text/plain", quality: 0 };
  }

  // Case 1: Direct body in payload
  if (payload.body?.data && !payload.parts) {
    const content = decodeBase64Url(payload.body.data);
    const quality = payload.mimeType === "text/plain" ? 30 : 50;
    
    return {
      content,
      mimeType: payload.mimeType || "text/plain",
      quality
    };
  }

  // Case 2: Multipart - recursively search for best content
  if (payload.parts && Array.isArray(payload.parts)) {
    const candidates = [];

    // First pass: collect all text MIME parts
    for (const part of payload.parts) {
      const mimeType = part.mimeType || "";
      
      // Look for text content
      if ((mimeType === "text/plain" || mimeType === "text/html") && part.body?.data) {
        candidates.push({
          content: decodeBase64Url(part.body.data),
          mimeType,
          quality: mimeType === "text/plain" ? 70 : 60 // Plain text preferred slightly
        });
      }

      // Recursively check nested multipart
      if (mimeType.startsWith("multipart/")) {
        const nested = findBestMimePart(part);
        if (nested.content) {
          candidates.push(nested);
        }
      }
    }

    // Sort by quality: plain text > html, longer content preferred
    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        if (a.mimeType === "text/plain" && b.mimeType === "text/html") return -1;
        if (a.mimeType === "text/html" && b.mimeType === "text/plain") return 1;
        return b.content.length - a.content.length;
      });

      return candidates[0];
    }
  }

  return { content: "", mimeType: "text/plain", quality: 0 };
}

/**
 * Extract and clean email body - main processing pipeline
 * @param {object} payload - Gmail message payload
 * @returns {object} { cleanBody, contentType, category }
 */
function extractAndCleanBody(payload) {
  try {
    const { content, mimeType } = findBestMimePart(payload);

    let cleanBody = "";
    let contentType = mimeType;

    if (mimeType === "text/html") {
      // DOM-based HTML cleaning
      const $ = load(content, {
        decodeEntities: true,
        normalizeWhitespace: true
      });

      // Remove junk sections
      removeJunkSections($);

      // Extract main content
      let mainContent = extractMainContent($);

      // Convert to text using proper HTML-to-text library
      cleanBody = htmlToText(mainContent, {
        wordwrap: false,
        preserveNewlines: true,
        tables: true,
        baseUrl: "https://gmail.com",
        limits: {
          maxDepth: 16
        }
      });

      contentType = "text/html";
    } else {
      // Plain text - just use as-is
      cleanBody = content;
      contentType = "text/plain";
    }

    // Final noise cleaning
    cleanBody = cleanNoise(cleanBody);

    // Remove junk patterns from final text
    Object.values(JUNK_PATTERNS).forEach(pattern => {
      cleanBody = cleanBody.replace(pattern, "");
    });

    // Final whitespace cleanup
    cleanBody = cleanBody.replace(/\n\s*\n\s*\n+/g, "\n\n").trim();

    return {
      cleanBody,
      contentType,
      quality: scoreHtmlQuality(content)
    };
  } catch (error) {
    console.error("Email extraction error:", error.message);
    return {
      cleanBody: "",
      contentType: "text/plain",
      quality: 0
    };
  }
}

/**
 * Generate summary from clean body
 * @param {string} body
 * @param {string} snippet
 * @param {number} maxLength
 * @returns {string}
 */
function generateSummary(body, snippet = "", maxLength = 200) {
  if (!body && !snippet) return "";

  // Prefer body for better summary
  let text = body || snippet;
  
  // Get first meaningful paragraph
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 15 && !p.match(/^[=\-_*#s]{3,}$/));

  if (paragraphs.length === 0) {
    return text.substring(0, maxLength).trim() + "...";
  }

  let summary = paragraphs[0];

  // Remove excessive punctuation
  summary = summary.replace(/[\s!?]{3,}/g, ".");

  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength).trim() + "...";
  }

  return summary;
}

/**
 * Main export - extract complete email with all metadata
 * @param {object} message - Gmail message object
 * @param {object} options - Optional configuration
 * @returns {object} Formatted email with clean body and metadata
 */
export function extractEmail(message, options = {}) {
  try {
    const headers = message.payload?.headers || [];

    const getHeader = (name) =>
      headers.find(h => h.name === name)?.value || "";

    const subject = getHeader("Subject");
    const from = getHeader("From");
    const date = getHeader("Date");

    // Extract and clean body
    const { cleanBody, contentType, quality } = extractAndCleanBody(message.payload);

    // Generate summary
    const summary = generateSummary(cleanBody, message.snippet, 200);

    // Detect category
    const category = detectEmailCategory(subject, cleanBody, from);

    return {
      id: message.id,
      subject,
      from,
      date,
      preview: message.snippet || summary,
      cleanBody,
      summary,
      category,
      contentType,
      quality: quality // For debugging/monitoring
    };
  } catch (error) {
    console.error("Email extraction error:", error);
    
    return {
      id: message.id || "",
      subject: "",
      from: "",
      date: "",
      preview: "",
      cleanBody: "[Error: Could not extract email body]",
      summary: "",
      category: "personal",
      contentType: "text/plain",
      quality: 0
    };
  }
}

/**
 * Legacy export for backward compatibility
 */
export function formatEmailResponse(message) {
  return extractEmail(message);
}
