import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Login page - Sign in with Google OAuth
 * (UI-only styling improvements, no business logic changes)
 */
function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/inbox");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="login-page">
      <div className="login-card max-w-md">
        <div className="mb-6 text-center">
          <h1 className="login-title">Zerobox</h1>
          <p className="login-subtitle">Smart Email Management & Intelligence</p>
        </div>

        <button
          className="google-signin-btn flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
        >
          <span className="text-xl">🟢</span>
          Login with Google
        </button>

        <p className="mt-4 text-xs text-slate-500">
          Continue with your Google account to access the dashboard.
        </p>
      </div>
    </div>
  );
}

export default Login;
