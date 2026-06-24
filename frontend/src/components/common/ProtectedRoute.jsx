import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const DEBUG = import.meta.env.DEV;
const log = (stage, message, data = null) => {
  if (DEBUG) {
    console.log(`[PROTECTED_ROUTE] ${stage}: ${message}`, data || "");
  }
};

/**
 * Protects routes that require authentication.
 * Redirects to /login if user is not authenticated.
 * Waits for auth initialization before rendering to prevent race conditions.
 * Allows demo mode to bypass authentication.
 */
function ProtectedRoute() {
  const { isAuthenticated, loading, user, error } = useAuth();

  // ===== DEMO MODE START =====
  const isDemo = localStorage.getItem("demoMode") === "true";
  
  if (isDemo) {
    log("DEMO_MODE", "Demo mode enabled - bypassing authentication");
    return <Outlet />;
  }
  // ===== DEMO MODE END =====

  // Still loading - don't redirect yet
  if (loading) {
    log("LOADING", "Auth check in progress", { 
      isAuthenticated,
      hasUser: !!user,
      hasError: !!error
    });
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <div style={{ fontSize: "1.2rem", fontWeight: "500" }}>
          Loading authentication...
        </div>
        <div style={{ fontSize: "0.875rem", color: "#666" }}>
          Verifying your credentials
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    log("ACCESS_DENIED", "User not authenticated - redirecting to login", {
      hasUser: !!user,
      isAuthenticated,
      error: error
    });
    return <Navigate to="/login" replace />;
  }

  // Authenticated - render protected content
  log("ACCESS_GRANTED", "User authenticated - allowing access", {
    userId: user?._id,
    userName: user?.name
  });
  return <Outlet />;
}

export default ProtectedRoute;
