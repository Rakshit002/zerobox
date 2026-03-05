/**
 * Email list component - renders emails from backend-shaped data.
 * Frontend does NOT extract domains - only renders what backend sends.
 * TODO: Replace dummy data with GET /api/emails/inbox
 */
function EmailList({ emailsData, selectedEmailId, onSelectEmail }) {
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
  const allEmails = emailsData.domains.flatMap((d) =>
    d.emails.map((email) => ({ ...email, domain: d.domain }))
  );

  return (
    <div className="email-list">
      {allEmails.map((email) => (
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
