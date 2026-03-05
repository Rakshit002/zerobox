/**
 * Email list component - renders emails from backend-shaped data.
 * - activeView: 'inbox' | 'starred' | 'pinned' | domain string
 * - searchQuery: text to search in from, subject, snippet, body (case-insensitive)
 * TODO: Replace dummy data with GET /api/emails/inbox
 */
function EmailList({
  emailsData,
  activeView,
  searchQuery = "",
  selectedEmailId,
  onSelectEmail,
}) {
  // Render emails exactly as structured by backend (domains -> emails)
  if (!emailsData?.domains || emailsData.domains.length === 0) {
    return (
      <div className="email-list-empty">
        <p>No emails to display</p>
      </div>
    );
  }

  // Flatten emails for display while preserving backend structure
  // Backend sends { domains: [{ domain, emails: [...] }] }
  let emails = emailsData.domains.flatMap((d) =>
    d.emails.map((email) => ({ ...email, domain: d.domain }))
  );

  // Step 1: Filter by active view (Inbox, Starred, Pinned, or Domain)
  if (activeView === "starred") {
    emails = emails.filter((e) => e.starred);
  } else if (activeView === "pinned") {
    emails = emails.filter((e) => e.pinned);
  } else if (activeView && activeView !== "inbox") {
    emails = emails.filter((e) => e.domain === activeView);
  }

  // Step 2: Filter by search query (searches in from, subject, snippet, body)
  const query = searchQuery?.trim()?.toLowerCase();
  if (query) {
    emails = emails.filter((email) => {
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

  if (emails.length === 0) {
    const emptyMsg = query
      ? `No emails match "${searchQuery}"`
      : activeView === "starred"
        ? "No starred emails"
        : activeView === "pinned"
          ? "No pinned emails"
          : activeView && activeView !== "inbox"
            ? `No emails from ${activeView}`
            : "No emails to display";
    return (
      <div className="email-list-empty">
        <p>{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div className="email-list">
      {emails.map((email) => (
        <div
          key={email.id}
          className={`email-item ${selectedEmailId === email.id ? "selected" : ""} ${email.unread ? "unread" : ""}`}
          onClick={() => onSelectEmail(email)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onSelectEmail(email);
          }}
          role="button"
          tabIndex={0}
        >
          <div className="email-item-header">
            <span className="email-from">{email.from}</span>
            <span className="email-date">{email.date}</span>
          </div>
          <div className="email-subject">{email.subject}</div>
          <div className="email-snippet">{email.snippet}</div>
          {(email.starred || email.pinned) && (
            <div className="email-badges">
              {email.starred && <span className="badge">★</span>}
              {email.pinned && <span className="badge">📌</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default EmailList;
