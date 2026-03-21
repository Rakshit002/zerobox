/**
 * Email Intelligence panel.
 * Displays important email detection result from backend analytics.
 * Clicking the important email opens it in the preview panel (via onImportantEmailClick).
 */
function EmailAnalytics({ importantEmail, onImportantEmailClick }) {
  const handleClick = () => {
    if (importantEmail?.id && onImportantEmailClick) {
      onImportantEmailClick(importantEmail);
    }
  };

  return (
    <section className="email-analytics-panel">
      <h3 className="email-analytics-title">Email Intelligence</h3>

      <div
        className={`email-analytics-card${importantEmail?.id ? " email-analytics-card--clickable" : ""}`}
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
        <p className="email-analytics-heading">Important Email:</p>

        {importantEmail ? (
          <>
            <p><strong>Subject:</strong> {importantEmail.subject}</p>
            <p><strong>Sender:</strong> {importantEmail.sender}</p>
            <p><strong>Reason:</strong> {importantEmail.reason}</p>
            {importantEmail.id && (
              <p className="email-analytics-hint">Click to open in preview</p>
            )}
          </>
        ) : (
          <p>No important emails detected</p>
        )}
      </div>
    </section>
  );
}

export default EmailAnalytics;
