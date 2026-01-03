import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // 1. Not logged in? Go to login
  if (!user) return <Navigate to="/login" replace />;

  // 2. Logged in, but wrong role? Redirect based on actual role
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  // 3. Authorized
  return children;
};

export default ProtectedRoute;