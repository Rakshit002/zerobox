/**
 * DEMO MODE DATA
 * Static email dataset for demo/preview without authentication
 * Used when localStorage.demoMode === "true"
 */

export const demoEmailsList = [
  {
    id: "demo_001",
    from: "Sarah Chen <sarah.chen@techcorp.com>",
    subject: "Q4 Project Planning - Your Input Needed",
    snippet: "Hey team! I wanted to get everyone's thoughts on the Q4 roadmap before we lock it in. The timeline is tight but I think we can make it work if we...",
    body: "<p>Hey team!</p><p>I wanted to get everyone's thoughts on the Q4 roadmap before we lock it in. The timeline is tight but I think we can make it work if we prioritize correctly.</p><p>Key milestones:</p><ul><li>Feature A: Sept 15</li><li>Feature B: Oct 1</li><li>Release: Oct 31</li></ul><p>Looking forward to your feedback!</p><p>Best,<br>Sarah</p>",
    date: "March 28, 2024",
    domain: "techcorp.com",
    unread: true,
    starred: false,
    pinned: false
  },
  {
    id: "demo_002",
    from: "James Wilson <james@projectmanagement.io>",
    subject: "Action Required: Expense Report Approval",
    snippet: "Your expense report for the Feb client visit is pending approval. Please review and confirm the following items before we process...",
    body: "<p>Hello,</p><p>Your expense report for the Feb client visit is pending approval. Please review the attached details:</p><p>• Hotel: $250<br>• Meals: $145<br>• Transportation: $89<br>Total: $484</p><p>Please confirm and we'll process it immediately.</p><p>Thanks!<br>James</p>",
    date: "March 27, 2024",
    domain: "projectmanagement.io",
    unread: true,
    starred: false,
    pinned: false
  },
  {
    id: "demo_003",
    from: "Emma Rodriguez <emma@startup.dev>",
    subject: "New API Integration - Documentation Ready",
    snippet: "Great news! The API documentation for the new integration is finally ready. We've tested it extensively and it's ready for production deployment...",
    body: "<p>Great news!</p><p>The API documentation for the new integration is finally ready. We've tested it extensively and it's ready for production deployment.</p><p>Key features:</p><ul><li>RESTful endpoints</li><li>Webhook support</li><li>Rate limiting: 10k req/min</li></ul><p>Check out the full docs at: docs.startup.dev/api</p><p>Cheers,<br>Emma</p>",
    date: "March 26, 2024",
    domain: "startup.dev",
    unread: false,
    starred: true,
    pinned: false
  },
  {
    id: "demo_004",
    from: "Michael Johnson <michael.johnson@company.com>",
    subject: "Weekly Standup - March 25 Summary",
    snippet: "Here's a summary of this week's achievements and blockers. Overall progress is on track with a few items needing attention...",
    body: "<p>Team,</p><p>Here's a summary of this week's achievements:</p><p><strong>Completed:</strong></p><ul><li>Sprint planning complete</li><li>3 bugs fixed</li><li>Documentation updated</li></ul><p><strong>Blockers:</strong></p><ul><li>Waiting on design assets</li></ul><p>Let's sync on the blockers next Monday.</p><p>Michael</p>",
    date: "March 25, 2024",
    domain: "company.com",
    unread: false,
    starred: false,
    pinned: true
  },
  {
    id: "demo_005",
    from: "Lisa Park <lisa@innovatelabs.com>",
    subject: "Customer Feedback: Feature Request Summary",
    snippet: "We've compiled feedback from 50+ users about the top 5 requested features. Here's what stood out most in the survey...",
    body: "<p>Hi,</p><p>We've compiled feedback from 50+ users about the top 5 requested features:</p><ol><li>Dark mode (72% requested)</li><li>Mobile app (68% requested)</li><li>Custom workflows (55% requested)</li><li>Team collaboration (48% requested)</li><li>API webhooks (42% requested)</li></ol><p>Dark mode should be our next priority.</p><p>Lisa</p>",
    date: "March 24, 2024",
    domain: "innovatelabs.com",
    unread: false,
    starred: true,
    pinned: true
  },
  {
    id: "demo_006",
    from: "David Kumar <david@analytics.team>",
    subject: "Monthly Dashboard Report - Metrics Look Good",
    snippet: "The March metrics are in and we're seeing great growth across all key indicators. User engagement is up 23% compared to last month...",
    body: "<p>Team,</p><p>The March metrics are in:</p><ul><li>User Growth: +23%</li><li>Engagement: +18%</li><li>Retention: 92%</li><li>Revenue: +15%</li></ul><p>This is our best month yet!</p><p>Let's maintain this momentum in Q2.</p><p>David</p>",
    date: "March 23, 2024",
    domain: "analytics.team",
    unread: false,
    starred: false,
    pinned: false
  },
  {
    id: "demo_007",
    from: "Nina Patel <nina.patel@design.studio>",
    subject: "Design Review - New UI Components",
    snippet: "I've completed the design review for the new UI component library. All mockups are ready for developer feedback and implementation timeline is...",
    body: "<p>Team,</p><p>I've completed the design review for the new UI component library:</p><p><strong>Components ready:</strong></p><ul><li>Button variants (primary, secondary, outlined)</li><li>Form inputs with validation states</li><li>Modal dialogs</li><li>Navigation bars</li></ul><p>Ready for implementation starting next sprint.</p><p>Nina</p>",
    date: "March 22, 2024",
    domain: "design.studio",
    unread: false,
    starred: false,
    pinned: false
  },
  {
    id: "demo_008",
    from: "Alex Turner <alex@commerce.systems>",
    subject: "URGENT: Production Issue - Database Performance",
    snippet: "We're experiencing database slowdown on production. Response times have increased from 50ms to 500ms. Need immediate attention...",
    body: "<p>URGENT!</p><p>We're experiencing database slowdown on production:</p><ul><li>Response times: 50ms → 500ms</li><li>Error rate: 2%</li><li>Affected services: 3</li></ul><p>Database team is investigating now. I'll update you in 1 hour.</p><p>Alex</p>",
    date: "March 21, 2024",
    domain: "commerce.systems",
    unread: true,
    starred: false,
    pinned: false
  },
  {
    id: "demo_009",
    from: "Sophie Chen <sophie@branding.co>",
    subject: "Brand Guidelines Update - New Logo Version",
    snippet: "We've finalized the updated brand guidelines with the new logo version. Please review the attachment and let us know if you have any questions...",
    body: "<p>Hi All,</p><p>We've finalized the updated brand guidelines with the new logo version.</p><p><strong>Key changes:</strong></p><ul><li>New primary color: #4338CA</li><li>Updated logo proportions</li><li>Font family: Inter</li></ul><p>See the attached PDF for full details.</p><p>Sophie</p>",
    date: "March 20, 2024",
    domain: "branding.co",
    unread: false,
    starred: false,
    pinned: false
  },
  {
    id: "demo_010",
    from: "Marcus Rodriguez <marcus@security.team>",
    subject: "Security Audit Results - Action Items Assigned",
    snippet: "The Q1 security audit is complete. We found 2 critical issues that need immediate attention and 5 medium-priority items for the roadmap...",
    body: "<p>Team,</p><p>The Q1 security audit is complete:</p><p><strong>Critical (immediate action):</strong></p><ul><li>SQL injection vulnerability in search</li><li>XSS in user comments</li></ul><p><strong>Medium priority:</strong></p><ul><li>CORS misconfiguration</li><li>Missing security headers</li></ul><p>Assigned to security team. Let's meet Wed to discuss.</p><p>Marcus</p>",
    date: "March 19, 2024",
    domain: "security.team",
    unread: true,
    starred: false,
    pinned: false
  }
];

/**
 * Demo analytics data
 */
export const demoAnalytics = {
  unreadCount: 4,
  topSender: "Sarah Chen <sarah.chen@techcorp.com>",
  topDomain: "techcorp.com",
  importantEmail: {
    id: "demo_008",
    subject: "URGENT: Production Issue - Database Performance",
    from: "alex@commerce.systems",
    date: "March 21, 2024"
  }
};

/**
 * Convert HTML body to clean plain text (demo equivalent of backend extraction)
 */
function htmlToCleanText(html) {
  if (!html) return "";
  let text = html;
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, "");
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim();
  
  return text;
}

/**
 * Detect email category (demo equivalent)
 */
function detectCategory(subject, body, from) {
  const lowerSubject = subject.toLowerCase();
  const lowerBody = body.toLowerCase();

  // Promotion
  const promotionKeywords = ["save", "discount", "offer", "deal", "sale", "limited time", "exclusive"];
  if (promotionKeywords.some(kw => lowerSubject.includes(kw))) return "promotion";

  // Newsletter
  if (lowerSubject.includes("newsletter") || from.includes("noreply")) return "newsletter";

  // Updates
  if (lowerSubject.includes("update") || lowerSubject.includes("notification")) return "updates";

  return "personal";
}

/**
 * Get a single demo email by ID
 */
export function getDemoEmailById(emailId) {
  const email = demoEmailsList.find((e) => e.id === emailId);
  if (!email) return null;

  const cleanBody = htmlToCleanText(email.body);
  const category = detectCategory(email.subject, cleanBody, email.from);
  
  // Format demo email to match new backend response structure
  return {
    email: {
      id: email.id,
      from: email.from,
      subject: email.subject,
      date: email.date,
      preview: email.snippet,
      cleanBody,
      summary: email.snippet,
      category,
      contentType: "text/html",
      quality: 75
    }
  };
}

/**
 * Get all demo emails with optional filtering and pagination
 */
export function getDemoEmails(pageToken = null, searchQuery = null) {
  let filtered = demoEmailsList;

  // Apply search filter (searches in from, subject, snippet, body)
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((email) => {
      const from = (email.from || "").toLowerCase();
      const subject = (email.subject || "").toLowerCase();
      const snippet = (email.snippet || "").toLowerCase();
      const body = (email.body || "").toLowerCase();
      return (
        from.includes(query) ||
        subject.includes(query) ||
        snippet.includes(query) ||
        body.includes(query)
      );
    });
  }

  // Simple pagination simulation
  const pageSize = 10;
  const pageNum = pageToken ? parseInt(pageToken) : 0;
  const start = pageNum * pageSize;
  const end = start + pageSize;
  const emails = filtered.slice(start, end);

  return {
    emails,
    nextPageToken: end < filtered.length ? (pageNum + 1).toString() : null
  };
}

/**
 * Get demo analytics
 */
export function getDemoAnalytics() {
  return demoAnalytics;
}
