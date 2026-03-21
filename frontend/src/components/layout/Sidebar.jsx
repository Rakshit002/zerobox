import { useNavigate } from "react-router-dom";

/**
 * Sidebar navigation component.
 * activeView: 'inbox' | 'starred' | 'pinned' | domain string (e.g. 'google.com')
 * domains: derived from backend data - TODO: GET /api/domains
 */
function Sidebar({ 
   domains ,
   domainStats,
  inboxCount,
  pinnedCount,
  starredCount,
  activeView,
   onViewChange = [] }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Call POST /api/auth/logout before navigating
    navigate("/login");
  };

  const setActive = (view) => () => onViewChange?.(view);

  const isActive = (view) => activeView === view;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li>
            <button
              className={`sidebar-item ${isActive("inbox") ? "active" : ""}`}
              onClick={setActive("inbox")}
            >
              Inbox ({inboxCount})
            </button>
          </li>
          <li>
            <button
              className={`sidebar-item ${isActive("starred") ? "active" : ""}`}
              onClick={setActive("starred") }
            >
              ⭐ Starred ({starredCount})
            </button>
          </li>
          <li>
            <button
              className={`sidebar-item ${isActive("pinned") ? "active" : ""}`}
              onClick={setActive("pinned")}
            >
              📌Pinned ({pinnedCount})
            </button>
          </li>
        </ul>

        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Domains</h3>
          <ul className="sidebar-menu">
            {domains.map((domain) => (
              <li key={domain}>
                <button
                  className={`sidebar-item domain-item ${isActive(domain) ? "active" : ""}`}
                  onClick={setActive(domain)}
                >
                  {domain} ({domainStats[domain]||0})
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;


// function Sidebar({ domains, setActiveView }) {

//   return (
//     <div className="sidebar">

//       <div onClick={() => setActiveView("inbox")}>
//         Inbox
//       </div>

//       {domains.map(domain => (
//         <div
//           key={domain}
//           onClick={() => setActiveView(domain)}
//         >
//           {domain}
//         </div>
//       ))}

//     </div>
//   );
// }

// export default Sidebar;
