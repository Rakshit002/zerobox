import { useNavigate } from "react-router-dom";

/**
 * Sidebar navigation component.
 * TODO: Fetch domains from backend - currently using dummy data.
 */
function Sidebar() {
  const navigate = useNavigate();

  // TODO: Replace with GET /api/domains - placeholder domain list
  const domains = ["google.com", "github.com", "example.org"];

  const handleLogout = () => {
    // TODO: Call POST /api/auth/logout before navigating
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li>
            <button className="sidebar-item active">Inbox</button>
          </li>
          <li>
            <button className="sidebar-item">Starred</button>
          </li>
          <li>
            <button className="sidebar-item">Pinned</button>
          </li>
        </ul>

        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Domains</h3>
          <ul className="sidebar-menu">
            {domains.map((domain) => (
              <li key={domain}>
                <button className="sidebar-item domain-item">{domain}</button>
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
