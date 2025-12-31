import VacantRooms from "../pages/admin/VacantRooms";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/login";   // ✅ FIXED (case-sensitive)
import Signup from "../pages/auth/Signup";

import StudentDashboard from "../pages/student/StudentDashboard";
import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Feedback from "../pages/student/Feedback";

import { useAuth } from "../context/AuthContext";


/* 🔹 Redirect user based on role */
function HomeRedirect() {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (role === "student") return <Navigate to="/student" />;
  if (role === "faculty") return <Navigate to="/faculty" />;
  if (role === "admin") return <Navigate to="/admin" />;

  return <Navigate to="/login" />;
}

/* 🔹 Protect role-based routes */
function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: userRole, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && role !== userRole) return <Navigate to="/login" />;

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/test-vacant" element={<VacantRooms />} />
      {/* 🔹 Default route -admin faculty page*/} 
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/Feedback" element={< Feedback />} />
      {/* 🔹 Default route -admin faculty page*/} 
      <Route path="/" element={<HomeRedirect />} />


      {/* 🔹 Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 🔹 Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* 🔹 Faculty */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute role="faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />

      {/* 🔹 Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* 🔹 Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
