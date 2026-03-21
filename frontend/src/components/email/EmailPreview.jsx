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
    <div className="email-preview">
      <div className="email-preview-header">
        <h2 className="email-preview-subject">{selectedEmail.subject}</h2>
        <div className="email-preview-actions">
          {/* {unread && (
            // <button
            //   className="preview-btn"
            //   onClick={handleMarkAsRead}
            //   title="Mark as Read"
            // >
            //   Mark as Read
            // </button>
          )} */}
          {/* <button
            className={`preview-btn ${starred ? "active" : ""}`}
            onClick={handleStar}
            title={starred ? "Unstar" : "Star"}
          >
            {starred ? "★" : "☆"} Star
          </button>
          <button
            className={`preview-btn ${pinned ? "active" : ""}`}
            onClick={handlePin}
            title={pinned ? "Unpin" : "Pin"}
          >
            📌 Pin
          </button> */}
        </div>
      </div>
      <div className="email-preview-meta">
        <span className="preview-from">From: {selectedEmail.from}</span>
        <span className="preview-date">{selectedEmail.date}</span>
      </div>
      <hr/>
      <div className="email-body" dangerouslySetInnerHTML={{ __html: selectedEmail.body }}>

    </div>
    </div>
  );
}

export default EmailPreview;
