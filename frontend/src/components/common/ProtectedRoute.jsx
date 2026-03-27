import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Protects routes that require authentication.
 * Redirects to /login if user is not authenticated.
 * Waits for auth initialization before rendering to prevent race conditions.
 * Allows demo mode to bypass authentication.
 */
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // ===== DEMO MODE START =====
  const isDemo = localStorage.getItem("demoMode") === "true";
  // ===== DEMO MODE END =====

  // Still loading - don't redirect yet
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div>Loading...</div>
      </div>
    );
  }

  // ===== DEMO MODE START =====
  // In demo mode, bypass authentication requirement
  if (isDemo) {
    return <Outlet />;
  }
  // ===== DEMO MODE END =====

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated - render protected content
  return <Outlet />;
}

export default ProtectedRoute;
