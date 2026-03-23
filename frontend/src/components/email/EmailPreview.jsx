/**
 * Email preview panel - shows selected email content with action buttons.
 * TODO: PATCH /api/emails/:id/read
 * TODO: PATCH /api/emails/:id/star
 * TODO: POST /api/pins
 */
function EmailPreview({ selectedEmail, onEmailUpdate }) {
  if (!selectedEmail) {
    return (
      <div className="email-preview-empty">
        <p>Select an email to view</p>
      </div>
    );
  }

  const { starred = false, pinned = false, unread = true } = selectedEmail;

  const handleMarkAsRead = () => {
    // TODO: PATCH /api/emails/:id/read
    onEmailUpdate?.(selectedEmail.id, { unread: false });
  };

  const handleStar = () => {
    // TODO: PATCH /api/emails/:id/star
    onEmailUpdate?.(selectedEmail.id, { starred: !starred });
  };

  const handlePin = () => {
    // TODO: POST /api/pins (or PATCH pins endpoint)
    onEmailUpdate?.(selectedEmail.id, { pinned: !pinned });
  };

  return (
    <div
      className="email-preview"
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "1rem",
        background: "#ffffff",
        padding: "1.25rem",
        boxShadow: "0 3px 10px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>{selectedEmail.subject}</h2>
          <p style={{ fontSize: "0.9rem", color: "#475569", margin: "0.35rem 0 0" }}>From: {selectedEmail.from}</p>
          <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.1rem 0 0" }}>{selectedEmail.date}</p>
        </div>

        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            style={{
              padding: "0.35rem 0.7rem",
              border: "1px solid #cbd5e1",
              borderRadius: "0.5rem",
              cursor: "pointer",
              background: starred ? "#eef2ff" : "#f8fafc",
            }}
            onClick={handleStar}
            title={starred ? "Unstar" : "Star"}
          >
            {starred ? "⭐" : "☆"}
          </button>
          <button
            style={{
              padding: "0.35rem 0.7rem",
              border: "1px solid #cbd5e1",
              borderRadius: "0.5rem",
              cursor: "pointer",
              background: pinned ? "#eef2ff" : "#f8fafc",
            }}
            onClick={handlePin}
            title={pinned ? "Unpin" : "Pin"}
          >
            {pinned ? "📌" : "📍"}
          </button>
          {unread && (
            <span style={{ borderRadius: "0.5rem", background: "#e0e7ff", fontSize: "0.72rem", color: "#4338ca", padding: "0.18rem 0.45rem" }}>
              Unread
            </span>
          )}
        </div>
      </div>
      <div style={{ marginTop: "1rem", fontSize: "0.95rem", lineHeight: "1.6", color: "#334155" }} dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
    </div>
  );
}

export default EmailPreview;
