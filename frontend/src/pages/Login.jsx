/**
 * Login page - Sign in with Google OAuth
 * TODO: Backend Google OAuth route at /api/auth/google
 */
function Login() {
  const handleGoogleSignIn = () => {
    // TODO: Backend Google OAuth route - redirect to backend auth endpoint
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">UnifiedInbox</h1>
        <p className="login-subtitle">Manage your important emails in one place</p>
        <button className="google-signin-btn" onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
