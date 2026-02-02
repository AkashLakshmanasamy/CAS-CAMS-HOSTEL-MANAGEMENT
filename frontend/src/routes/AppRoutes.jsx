import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth & Context
import Login from "../pages/auth/login"; // Ensure casing matches file (Login.jsx vs login.jsx)
import Signup from "../pages/auth/Signup";
import { useAuth } from "../context/AuthContext";

// Layouts
import StudentLayout from "../pages/student/StudentLayout"; 
import AdminDashboard from "../pages/admin/AdminDashboard"; // Now acts as AdminLayout

// Student Pages
import StudentDashboard from "../pages/student/StudentDashboard";
import RoomAllocation from "../pages/student/RoomAllocation";
import LeaveApplication from "../pages/student/LeaveApplication";
import Feedback from "../pages/student/Feedback";
import StudentProfile from "../pages/student/StudentProfile";
import Schedule from "../pages/student/Schedule"; 
import Rules from "../pages/student/Rules";

// Admin Pages (Components)
import RoomRequests from "../pages/admin/RoomRequests"; // You need to import this!
import VacantRooms from "../pages/admin/VacantRooms";
import AdminMenuUpdate from "../pages/admin/AdminMenuUpdate"; 
import AdminRulesUpdate from "../pages/admin/AdminRulesUpdate"; 
import AdminAnnouncements from "../pages/admin/AdminAnnouncements";
import LeaveManagement from "../pages/admin/LeaveManagement";
import FeedbackManagement from "../pages/admin/FeedbackManagement";
import StudentRecords from "../pages/admin/StudentRecords";

/* 🔹 Redirect user based on role */
function HomeRedirect() {
  const { role, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (role === "student") return <Navigate to="/student" />;
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

      {/* 🔹 STUDENT ROUTES */}
      <Route element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/room-allocation" element={<RoomAllocation />} />
        <Route path="/StudentProfile" element={<StudentProfile />} />
        <Route path="/Feedback" element={<Feedback />} />
        <Route path="/LeaveAppliction" element={<LeaveApplication />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/rules" element={<Rules />} />
      </Route>

      {/* 🔹 ADMIN ROUTES (Nested Structure) */}
      <Route element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}>
        
        {/* Index route: What shows when you go to exactly /admin */}
        <Route index element={<RoomRequests />} /> 

        {/* Sub-routes: Renders INSIDE the Outlet of AdminDashboard */}
        <Route path="/admin/students" element={<StudentRecords />} />
        <Route path="/admin/feedback" element={<FeedbackManagement />} />
        <Route path="/admin/leave" element={<LeaveManagement />} />
        <Route path="/admin/vacant" element={<VacantRooms />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/update-menu" element={<AdminMenuUpdate />} />
        <Route path="/admin/update-rules" element={<AdminRulesUpdate />} />
        
      </Route>

      {/* 🔹 Fallback */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}