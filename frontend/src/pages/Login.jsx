import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEBUG = import.meta.env.DEV;
const getBackendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? "https://zerobox.onrender.com" : "http://localhost:3000");
};

const log = (stage, message, data = null) => {
  if (DEBUG) {
    console.log(`[LOGIN_PAGE] ${stage}: ${message}`, data || "");
  }
};

/**
 * Login page - Sign in with Google OAuth
 * (UI-only styling improvements, no business logic changes)
 */
function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user, error } = useAuth();

  // Auto-redirect authenticated users to inbox
  useEffect(() => {
    if (!loading && isAuthenticated) {
      log("REDIRECT", "User already authenticated - redirecting to inbox", {
        userId: user?._id,
        userName: user?.name
      });
      navigate("/inbox");
    }
  }, [isAuthenticated, loading, navigate, user]);

  const handleGoogleSignIn = () => {
    log("OAUTH_START", "Starting Google OAuth flow");
    const backendUrl = getBackendUrl();
    
    const oauthUrl = `${backendUrl}/api/auth/google?redirect_origin=${encodeURIComponent(
      window.location.origin
    )}`;
    log("OAUTH_REDIRECT", "Redirecting to Google OAuth endpoint", { 
      oauthUrl 
    });
    
    window.location.href = oauthUrl;
  };

  if (loading) {
    log("LOADING", "Login page loading auth state");
    return (
      <div className="login-page">
        <div className="login-card max-w-md">
          <div className="mb-6 text-center">
            <h1 className="login-title">Zerobox</h1>
            <p className="login-subtitle">Initializing...</p>
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            minHeight: "50px"
          }}>
            <div>Checking your session...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if authentication previously failed
  if (error) {
    log("AUTH_ERROR", "Displaying authentication error", { error });
    return (
      <div className="login-page">
        <div className="login-card max-w-md">
          <div className="mb-6 text-center">
            <h1 className="login-title">Zerobox</h1>
            <p className="login-subtitle">Smart Email Management & Intelligence</p>
          </div>
          
          <div style={{
            padding: "1rem",
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            color: "#7f1d1d"
          }}>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              <strong>Error:</strong> {error}
            </p>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.75rem" }}>
              Please try again or contact support.
            </p>
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
