/**
 * Header with search and user profile.
 * - searchQuery: current search text (controlled by parent)
 * - onSearchChange: called when user types in search box
 * - user: logged-in user from GET /api/auth/me
 */
function Header({ user, searchQuery = "", onSearchChange }) {
  // ===== DEMO MODE START =====
  const isDemo = localStorage.getItem("demoMode") === "true";
  
  const handleExitDemo = () => {
    localStorage.removeItem("demoMode");
    window.location.href = "/";
  };
  // ===== DEMO MODE END =====

  return (
    <header className="header">
      {/* ===== DEMO MODE BANNER START ===== */}
      {isDemo && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            background: "#fbbf24",
            color: "#78350f",
            padding: "0.5rem",
            textAlign: "center",
            fontSize: "0.9rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            zIndex: 50
          }}
        >
          <span>🎯 Demo Mode - Sample data with pre-loaded emails</span>
          <button
            onClick={handleExitDemo}
            style={{
              background: "#78350f",
              color: "#fbbf24",
              border: "none",
              borderRadius: "0.25rem",
              padding: "0.25rem 0.75rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Exit Demo
          </button>
        </div>
      )}
      {/* ===== DEMO MODE BANNER END ===== */}

      {/* Search box - filters emails by from, subject, snippet, body */}
      <div className="header-search">
        <input
          type="search"
          placeholder="Search emails..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          aria-label="Search emails"
        />
      </div>
      <div className="header-user">
        <img
          src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
          alt={user?.name || "User"}
          className="user-avatar"
        />
        <div className="user-info">
          <span className="user-name">{user?.name || "User"}</span>
          <span className="user-email">{user?.email || ""}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
