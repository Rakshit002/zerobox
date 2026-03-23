// /**
//  * Email list component - renders emails from backend-shaped data.
//  * - activeView: 'inbox' | 'starred' | 'pinned' | domain string
//  * - searchQuery: text to search in from, subject, snippet, body (case-insensitive)
//  * TODO: Replace dummy data with GET /api/emails/inbox
//  */
// function EmailList({
//   emailsData,
//   activeView,
//   searchQuery = "",
//   selectedEmailId,
//   onSelectEmail,
// }) {
//   // Render emails exactly as structured by backend (domains -> emails)
//   if (!emailsData || emailsData.length === 0) {
//     return (
//       <div className="email-list-empty">
//         <p>No emails to display</p>
//       </div>
//     );
//   }

//   // Flatten emails for display while preserving backend structure
//   // Backend sends { domains: [{ domain, emails: [...] }] }
//   let emails = emailsData.flatMap((d) =>
//     d.emails.map((email) => ({ ...email, domain: d.domain }))
//   );

//   // Step 1: Filter by active view (Inbox, Starred, Pinned, or Domain)
//   if (activeView === "starred") {
//     emails = emails.filter((e) => e.starred);
//   } else if (activeView === "pinned") {
//     emails = emails.filter((e) => e.pinned);
//   } else if (activeView && activeView !== "inbox") {
//     emails = emails.filter((e) => e.domain === activeView);
//   }

//   // Step 2: Filter by search query (searches in from, subject, snippet, body)
//   const query = searchQuery?.trim()?.toLowerCase();
//   if (query) {
//     emails = emails.filter((email) => {
//       const from = (email.from || "").toLowerCase();
//       const subject = (email.subject || "").toLowerCase();
//       const snippet = (email.snippet || "").toLowerCase();
//       const body = (email.body || "").toLowerCase();
//       return (
//         from.includes(query) ||
//         subject.includes(query) ||
//         snippet.includes(query) ||
//         body.includes(query)
//       );
//     });
//   }

//   if (emails.length === 0) {
//     const emptyMsg = query
//       ? `No emails match "${searchQuery}"`
//       : activeView === "starred"
//         ? "No starred emails"
//         : activeView === "pinned"
//           ? "No pinned emails"
//           : activeView && activeView !== "inbox"
//             ? `No emails from ${activeView}`
//             : "No emails to display";
//     return (
//       <div className="email-list-empty">
//         <p>{emptyMsg}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="email-list">
//       {emails.map((email) => (
//         <div
//           key={email.id}
//           className={`email-item ${selectedEmailId === email.id ? "selected" : ""} ${email.unread ? "unread" : ""}`}
//           onClick={() => onSelectEmail(email)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter" || e.key === " ") onSelectEmail(email);
//           }}
//           role="button"
//           tabIndex={0}
//         >
//           <div className="email-item-header">
//             <span className="email-from">{email.from}</span>
//             <span className="email-date">{email.date}</span>
//           </div>
//           <div className="email-subject">{email.subject}</div>
//           <div className="email-snippet">{email.snippet}</div>
//           {(email.starred || email.pinned) && (
//             <div className="email-badges">
//               {email.starred && <span className="badge">★</span>}
//               {email.pinned && <span className="badge">📌</span>}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// export default EmailList;

import { pinEmail, starEmail ,unpinEmail, unstarEmail } from "../../api/EmailApi";
import toast from "react-hot-toast";
function EmailList({ emailsData, selectedEmailId, onSelectEmail, onEmailUpdate, loadingMore = false }) {

  const handlePin = async (email) => {
   try {

    if (email.pinned) {

      await unpinEmail(email.id);

      onEmailUpdate(email.id, { pinned: false });
         toast.success("Email unpinned succesfully");
    } else {

      await pinEmail(email.id);

      onEmailUpdate(email.id, { pinned: true });
       toast.success("Email pinned succesfully");
    }

  } catch (error) {
    console.error("Pin toggle failed", error);
  }
  };

  const handleStar = async (email) => {
    try {

      if (email.starred) {

        await unstarEmail(email.id);

        onEmailUpdate(email.id, { starred: false });
        toast.success("Email unstarred succesfully");
      } else {

        await starEmail(email.id);

        onEmailUpdate(email.id, { starred: true });
        toast.success("Email starred succesfully");
      }

    } catch (error) {
      console.error("Star failed", error);
    }
  };

  return (
    <div className="email-list">
      {emailsData.map((email) => (
        <div
          key={email.id}
          className={`email-item ${email.unread ? "unread" : ""} ${selectedEmailId === email.id ? "selected" : ""}`}
          onClick={() => onSelectEmail(email)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onSelectEmail(email);
            }
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.6rem" }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1e293b", margin: 0 }}>{email.from}</p>
              <h4 style={{ fontSize: "0.9rem", color: "#0f172a", margin: "4px 0" }}>{email.subject}</h4>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.snippet}</p>
            </div>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{email.date || "-"}</span>
          </div>

          <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button
              style={{ border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "0.22rem 0.45rem", fontSize: "0.75rem", cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                handlePin(email);
              }}
              aria-label={email.pinned ? "Unpin email" : "Pin email"}
            >
              {email.pinned ? "📌" : "📍"}
            </button>
            <button
              style={{ border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "0.22rem 0.45rem", fontSize: "0.75rem", cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                handleStar(email);
              }}
              aria-label={email.starred ? "Unstar email" : "Star email"}
            >
              {email.starred ? "⭐" : "☆"}
            </button>
            {email.unread && (
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#4f46e5" }}>Unread</span>
            )}
          </div>
        </div>
      ))}

      {loadingMore && (
        <div className="email-list-loader" role="status" aria-live="polite">
          <span className="email-list-loader-spinner" aria-hidden />
          <p className="email-list-loader-text">emails are loading</p>
        </div>
      )}
    </div>
  );
}

export default EmailList;