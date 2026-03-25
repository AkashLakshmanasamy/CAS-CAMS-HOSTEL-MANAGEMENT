import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth & Context
import Login from "../pages/auth/login"; 
import Signup from "../pages/auth/Signup";
import { useAuth } from "../context/AuthContext";

// Layouts
import StudentLayout from "../pages/student/StudentLayout"; 
import AdminDashboard from "../pages/admin/AdminDashboard"; 

// Student Pages
import StudentDashboard from "../pages/student/StudentDashboard";
import RoomAllocation from "../pages/student/RoomAllocation";
import LeaveApplication from "../pages/student/LeaveApplication";
import Feedback from "../pages/student/Feedback";
import StudentProfile from "../pages/student/StudentProfile";
import Schedule from "../pages/student/Schedule"; 
import Rules from "../pages/student/Rules";

// Admin Pages
import RoomRequests from "../pages/admin/RoomRequests"; 
import VacantRooms from "../pages/admin/VacantRooms";
import AdminMenuUpdate from "../pages/admin/AdminMenuUpdate"; 
import AdminRulesUpdate from "../pages/admin/AdminRulesUpdate"; 
import AdminAnnouncements from "../pages/admin/AdminAnnouncements";
import LeaveManagement from "../pages/admin/LeaveManagement";
import FeedbackManagement from "../pages/admin/FeedbackManagement";
import StudentRecords from "../pages/admin/StudentRecords";

// Hostel Setup component
import AdminHostelSetup from "../pages/admin/AdminHostelSetup"; 

/* 🔹 UPDATED: Redirect user based on role with PERSISTENCE check */
function HomeRedirect() {
  const { role, loading, isAuthenticated } = useAuth();

  // Reload pannum pothu storage-la irundhu data recover aaguara varai Loading screen kaatum
  if (loading) return <div className="loading-screen">Verifying Session...</div>;

  // Session irundha role-based dashboard-ku anuppum
  if (isAuthenticated) {
    if (role === "admin") return <Navigate to="/admin" />;
    return <Navigate to="/student" />;
  }

  // Session illai na mattum Login-ku pogum
  return <Navigate to="/login" />;
}

/* 🔹 Protect role-based routes (EXISTING LOGIC) */
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
        
        <Route index element={<RoomRequests />} /> 

        {/* Sub-routes */}
        <Route path="/admin/students" element={<StudentRecords />} />
        <Route path="/admin/feedback" element={<FeedbackManagement />} />
        <Route path="/admin/leave" element={<LeaveManagement />} />
        <Route path="/admin/vacant" element={<VacantRooms />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/update-menu" element={<AdminMenuUpdate />} />
        <Route path="/admin/update-rules" element={<AdminRulesUpdate />} />
        <Route path="/admin/setup" element={<AdminHostelSetup />} />
        
      </Route>

      {/* 🔹 Fallback */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}