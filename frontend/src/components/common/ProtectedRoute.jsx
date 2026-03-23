import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Protects routes that require authentication.
 * Redirects to /login if user is not authenticated.
 * Waits for auth initialization before rendering to prevent race conditions.
 */
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Still loading - don't redirect yet
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated - render protected content
  return <Outlet />;
}

export default ProtectedRoute;
