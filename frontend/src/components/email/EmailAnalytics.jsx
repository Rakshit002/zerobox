/**
 * Email Intelligence panel.
 * Displays important email detection result from backend analytics.
 * Clicking the important email opens it in the preview panel (via onImportantEmailClick).
 */
function EmailAnalytics({ importantEmail, topSender, topDomain, onImportantEmailClick }) {
  const handleClick = () => {
    if (importantEmail?.id && onImportantEmailClick) {
      onImportantEmailClick(importantEmail);
    }
  };

  return (
    <section className="email-analytics-panel" style={{ padding: "1rem" }}>
      <h3 className="email-analytics-title" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
        Dashboard Analytics
      </h3>
      <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
        <article className="email-analytics-card" style={{ background: "#ffffff", padding: "0.75rem", minHeight: "80px" }}>
          <p style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", margin: 0 }}>Top Sender</p>
          <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", margin: 0 }}>{topSender || "N/A"}</p>
        </article>
        <article className="email-analytics-card" style={{ background: "#ffffff", padding: "0.75rem", minHeight: "80px" }}>
          <p style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", margin: 0 }}>Top Domain</p>
          <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", margin: 0 }}>{topDomain || "N/A"}</p>
        </article>
        <article
          className="email-analytics-card"
          style={{ background: "#ffffff", padding: "0.75rem", minHeight: "80px", cursor: importantEmail?.id ? "pointer" : "default" }}
          onClick={importantEmail?.id ? handleClick : undefined}
          onKeyDown={(e) => {
            if (importantEmail?.id && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              handleClick();
            }
          }}
          role={importantEmail?.id ? "button" : undefined}
          tabIndex={importantEmail?.id ? 0 : undefined}
        >
          <p style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", margin: 0 }}>Important Email</p>
          {importantEmail ? (
            <>
              <p style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0.3rem 0 0" }}>{importantEmail.subject}</p>
              <p style={{ fontSize: "0.8rem", color: "#475569", margin: "0.25rem 0 0" }}>From {importantEmail.sender}</p>
              <p style={{ fontSize: "0.75rem", color: "#4f46e5", margin: "0.35rem 0 0" }}>Click to view</p>
            </>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.35rem 0 0" }}>No important email found</p>
          )}
        </article>
      </div>
    </section>
  );

}

export default EmailAnalytics;
