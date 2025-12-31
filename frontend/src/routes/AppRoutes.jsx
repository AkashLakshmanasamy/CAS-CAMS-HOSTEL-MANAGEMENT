// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth & Layouts
import Login from "../pages/auth/login";
import Signup from "../pages/auth/Signup";
import StudentLayout from "../pages/student/StudentLayout"; // ✅ Navbar Layout
import { useAuth } from "../context/AuthContext";

// Student Pages
import StudentDashboard from "../pages/student/StudentDashboard";
import RoomAllocation from "../pages/student/RoomAllocation"; // ✅ Added
import LeaveApplication from "../pages/student/LeaveApplication";
import Feedback from "../pages/student/Feedback";
import StudentProfile from "../pages/student/StudentProfile";

// Faculty & Admin Pages
import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import VacantRooms from "../pages/admin/VacantRooms";

/* 🔹 Redirect user based on role */
function HomeRedirect() {
  const { role, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (role === "student") return <Navigate to="/student" />;
  if (role === "faculty") return <Navigate to="/faculty" />;
  if (role === "admin") return <Navigate to="/admin" />;
  return <Navigate to="/login" />;
}

/* 🔹 Protect role-based routes */
function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: userRole, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && role !== userRole) return <Navigate to="/login" />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      
      {/* 🔹 Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<HomeRedirect />} />

      {/* 🔹 STUDENT ROUTES (Wrapped in Layout + Protection) */}
      <Route
        element={
          <ProtectedRoute role="student">
            <StudentLayout /> {/* ✅ This adds Navbar to all routes below */}
          </ProtectedRoute>
        }
      >
        {/* Dashboard Landing Page */}
        <Route path="/student" element={<StudentDashboard />} />
        
        {/* Separate Functionality Pages */}
        <Route path="/room-allocation" element={<RoomAllocation />} />
        <Route path="/StudentProfile" element={<StudentProfile />} />
        <Route path="/Feedback" element={<Feedback />} />
        <Route path="/LeaveAppliction" element={<LeaveApplication />} />
      </Route>

      {/* 🔹 FACULTY ROUTES */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute role="faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />

      {/* 🔹 ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/test-vacant" element={<VacantRooms />} />

      {/* 🔹 Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}