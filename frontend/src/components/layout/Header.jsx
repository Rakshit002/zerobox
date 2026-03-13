/**
 * Header with search and user profile.
 * - searchQuery: current search text (controlled by parent)
 * - onSearchChange: called when user types in search box
 * - user: logged-in user from GET /api/auth/me
 */
function Header({ user, searchQuery = "", onSearchChange }) {
  return (
    <header className="header">
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
