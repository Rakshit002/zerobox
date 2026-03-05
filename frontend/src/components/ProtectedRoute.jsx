import { Navigate, Outlet } from "react-router-dom";

// TODO: Replace this logic with GET /api/auth/me - fetch user session from backend
const isAuthenticated = true;

/**
 * Protects routes that require authentication.
 * Redirects to /login if user is not authenticated.
 */
function ProtectedRoute() {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
