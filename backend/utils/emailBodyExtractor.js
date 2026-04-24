/**
 * Email Body Extraction Utility
 * 
 * Handles:
 * - Recursive MIME part traversal (multipart emails, nested attachments)
 * - Base64URL decoding (Gmail API format)
 * - HTML sanitization and cleaning
 * - Plain text extraction and formatting
 * - Summary generation
 */

/**
 * Decode base64url data (Gmail API format)
 * Gmail uses base64url which has - and _ instead of + and /
 * 
 * @param {string} data - Base64url encoded string
 * @returns {string} Decoded UTF-8 text
 */
function decodeBase64Url(data) {
  try {
    if (!data) return "";
    
    // Replace base64url characters with standard base64 characters
    const base64 = data
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    
    // Decode base64 to buffer, then to UTF-8 string
    return Buffer.from(base64, "base64").toString("utf8");
  } catch (error) {
    console.error("Base64URL decode error:", error.message);
    return "";
  }
}

/**
 * Recursively find email body from MIME parts
 * Strategy:
 * 1. Prefer text/plain (most readable)
 * 2. Fallback to text/html (convert to readable text)
 * 3. Handle nested multipart structures
 * 
 * @param {object} payload - Gmail message payload object
 * @returns {object} { content, mimeType } - Text content and its original MIME type
 */
function extractBodyFromPayload(payload) {
  if (!payload) {
    return { content: "", mimeType: "text/plain" };
  }

  // Case 1: Simple email - body is directly in payload
  if (payload.body?.data && !payload.parts) {
    return {
      content: decodeBase64Url(payload.body.data),
      mimeType: payload.mimeType || "text/plain"
    };
  }

  // Case 2: Multipart email - traverse parts array
  if (payload.parts && Array.isArray(payload.parts)) {
    let plainTextPart = null;
    let htmlPart = null;
    let alternativePart = null;

    for (const part of payload.parts) {
      const mimeType = part.mimeType || "";

      // Prefer plain text (most readable)
      if (mimeType === "text/plain" && part.body?.data) {
        plainTextPart = {
          content: decodeBase64Url(part.body.data),
          mimeType: "text/plain"
        };
        // Plain text is highest priority, stop searching
        break;
      }

      // Secondary: HTML can be converted to readable text
      if (mimeType === "text/html" && part.body?.data && !htmlPart) {
        htmlPart = {
          content: decodeBase64Url(part.body.data),
          mimeType: "text/html"
        };
      }

      // Tertiary: multipart/alternative contains both plain and HTML
      if (mimeType === "multipart/alternative" && part.parts && !alternativePart) {
        alternativePart = extractBodyFromPayload(part);
      }
    }

    // Return in order of preference
    if (plainTextPart) return plainTextPart;
    if (htmlPart) return htmlPart;
    if (alternativePart) return alternativePart;
  }

  return { content: "", mimeType: "text/plain" };
}

/**
 * Sanitize HTML - remove malicious scripts, styles, trackers, and footer junk
 * 
 * @param {string} html - Raw HTML content
 * @returns {string} Cleaned HTML
 */
function sanitizeHtml(html) {
  if (!html) return "";

  let cleaned = html;

  // Remove script tags and content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove style tags and content
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove common email footer patterns (unsubscribe links, etc.)
  cleaned = cleaned.replace(/unsubscribe|manage preferences|email preferences/gi, (match) => "");

  // Remove tracking pixels (1x1 images)
  cleaned = cleaned.replace(/<img[^>]*width=['"]?1['"]?[^>]*height=['"]?1['"]?[^>]*>/gi, "");
  cleaned = cleaned.replace(/<img[^>]*height=['"]?1['"]?[^>]*width=['"]?1['"]?[^>]*>/gi, "");

  // Remove tracking redirects in href (bit.ly, tinyurl, etc.)
  cleaned = cleaned.replace(/href=['"]?https?:\/\/(bit\.ly|tinyurl|ow\.ly|short\.link|click\.|track\.)[^'"]*['"]/gi, (match) => {
    // Keep the link tag structure but mark it as a redirect
    return match.replace(/https?:\/\/[^'"]+/, "javascript:void(0)");
  });

  // Remove onclick handlers (tracking scripts)
  cleaned = cleaned.replace(/\s*on[a-z]+\s*=\s*['"][^'"]*['"]/gi, "");
  cleaned = cleaned.replace(/\s*on[a-z]+\s*=\s*[^\s>]*/gi, "");

  // Remove Microsoft Office Word namespace and XML
  cleaned = cleaned.replace(/<\?xml[^>]*\?>/gi, "");
  cleaned = cleaned.replace(/xmlns[^=]*=["'][^"']*["']/gi, "");
  cleaned = cleaned.replace(/<o:[^>]*>/gi, "");
  cleaned = cleaned.replace(/<\/o:[^>]*>/gi, "");

  // Remove comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");

  // Remove empty divs and spans (often used for tracking)
  cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/gi, "");
  cleaned = cleaned.replace(/<span[^>]*>\s*<\/span>/gi, "");

  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, " ");

  return cleaned.trim();
}

/**
 * Convert HTML to readable plain text
 * Preserves structure: paragraphs, lists, headers, links
 * 
 * @param {string} html - HTML content
 * @returns {string} Readable plain text
 */
function htmlToPlainText(html) {
  if (!html) return "";

  let text = html;

  // Preserve line breaks for block elements
  text = text.replace(/<\/?(p|div|br|li|hr)[^>]*>/gi, "\n");
  text = text.replace(/<\/?(h[1-6]|blockquote)[^>]*>/gi, "\n");
  text = text.replace(/<\/?ol[^>]*>/gi, "\n");
  text = text.replace(/<\/?ul[^>]*>/gi, "\n");

  // Convert table rows to readable format
  text = text.replace(/<\/?tr[^>]*>/gi, "\n");
  text = text.replace(/<td[^>]*>/gi, " | ");
  text = text.replace(/<\/td[^>]*>/gi, "");
  text = text.replace(/<th[^>]*>/gi, " | ");
  text = text.replace(/<\/th[^>]*>/gi, "");

  // Convert links: <a href="url">text</a> -> text (url)
  text = text.replace(/<a\s+href=['"]([^'"]*)['"]\s*>([^<]*)<\/a>/gi, (match, url, linkText) => {
    return linkText ? `${linkText} (${url})` : url;
  });

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]*>/g, "");

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/g, " "); // Other entities

  // Clean up multiple spaces and newlines
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n\s*\n/g, "\n");

  return text.trim();
}

/**
 * Generate short summary from email body
 * Extracts first meaningful paragraph, limiting length
 * 
 * @param {string} body - Email body text
 * @param {number} maxLength - Maximum summary length (default 200)
 * @returns {string} Summary text
 */
function generateSummary(body, maxLength = 200) {
  if (!body) return "";

  // Split by double newlines to get paragraphs
  const paragraphs = body
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (paragraphs.length === 0) return "";

  // Get first substantial paragraph (not just "Hi" or greetings)
  let summary = "";
  for (const paragraph of paragraphs) {
    if (paragraph.length > 20) { // Skip very short greetings
      summary = paragraph;
      break;
    }
  }

  // Fallback to first paragraph if no substantial one found
  if (!summary) {
    summary = paragraphs[0];
  }

  // Truncate to maxLength
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength).trim() + "...";
  }

  return summary;
}

/**
 * Extract and clean email body
 * Main entry point for email body extraction
 * 
 * @param {object} payload - Gmail message payload
 * @returns {object} { cleanBody, contentType, summary }
 */
export function extractCleanEmailBody(payload) {
  try {
    const { content, mimeType } = extractBodyFromPayload(payload);

    let cleanBody = content;
    let contentType = "text/plain";

    // If HTML, convert and sanitize
    if (mimeType === "text/html") {
      cleanBody = sanitizeHtml(content);
      cleanBody = htmlToPlainText(cleanBody);
      contentType = "text/html";
    }

    // Generate summary from clean body
    const summary = generateSummary(cleanBody, 200);

    return {
      cleanBody: cleanBody.trim(),
      contentType,
      summary
    };
  } catch (error) {
    console.error("Email body extraction error:", error.message);
    return {
      cleanBody: "[Error: Could not extract email body]",
      contentType: "text/plain",
      summary: ""
    };
  }
}

/**
 * Format complete email response with clean body
 * 
 * @param {object} message - Gmail message object
 * @returns {object} Formatted email with cleaned body
 */
export function formatEmailResponse(message) {
  const headers = message.payload.headers || [];

  const getHeader = (name) =>
    headers.find(h => h.name === name)?.value || "";

  const { cleanBody, summary } = extractCleanEmailBody(message.payload);

  return {
    id: message.id,
    from: getHeader("From"),
    subject: getHeader("Subject"),
    date: getHeader("Date"),
    snippet: message.snippet,
    cleanBody,
    summary
  };
}
