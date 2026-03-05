/**
 * Header with search and user profile.
 * TODO: Fetch user data from GET /api/auth/me
 */
function Header() {
  // Dummy user data - replace with API response from GET /api/auth/me
  const dummyUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
  };

  return (
    <header className="header">
      <div className="header-search">
        <input
          type="search"
          placeholder="Search emails..."
          className="search-input"
          disabled
        />
        {/* TODO: Wire search to backend API when implemented */}
      </div>
      <div className="header-user">
        <img
          src={dummyUser.avatar}
          alt={dummyUser.name}
          className="user-avatar"
        />
        <div className="user-info">
          <span className="user-name">{dummyUser.name}</span>
          <span className="user-email">{dummyUser.email}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
