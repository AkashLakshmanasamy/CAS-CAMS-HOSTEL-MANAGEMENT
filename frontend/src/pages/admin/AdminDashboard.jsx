import React, { useState } from "react";
import "../../styles/AdminDashboard.css";
import RoomRequests from "./RoomRequests";
import VacantRooms from "./VacantRooms";
import AdminMenuUpdate from "./AdminMenuUpdate";
import AdminRulesUpdate from "./AdminRulesUpdate";
import AdminAnnouncements from "./AdminAnnouncements";
import LeaveManagement from "./LeaveManagement";
/* ---------- Icon Helper ---------- */
const Icon = ({ path }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    width="18"
    height="18"
  >
    <path d={path} />
  </svg>
);

/* ---------- Icons ---------- */
const ICONS = {
  roomRequests:
    "M4 4h5v5H4V4zm7 0h5v5h-5V4zM4 11h5v5H4v-5zm7 0h5v5h-5v-5z",
  studentProfiles:
    "M15 8a3 3 0 10-6 0 3 3 0 006 0zM3 16a6 6 0 1112 0H3z",
  feedback:
    "M2 5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H7l-4 3v-3H4a2 2 0 01-2-2V5z",
  leaveApplications:
    "M6 2h8v2H6V2zm0 4h8v12H6V6z",
  vacantRooms:
    "M10 2a8 8 0 100 16 8 8 0 000-16z",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("roomRequests");

  /* ---------- TEMP PLACEHOLDERS ---------- */
  const renderTab = () => {
    switch (activeTab) {
      case "roomRequests":
        return <RoomRequests />;

      case "vacantRooms":
        return <VacantRooms/>;
  
      case "studentProfiles":
        return <h2>Student Profiles</h2>;
  
      case "feedback":
        return <h2>Feedback</h2>;
  
      case "leaveApplications":
        return <h2>Leave Applications</h2>;

      case "AdminMenuUpdate":
        return <AdminMenuUpdate/>
      
      case "AdminRulesUpdate":
        return <AdminRulesUpdate/>

      case "AdminAnnouncements":
        return <AdminAnnouncements/>

      case "LeaveManagement":
        return <LeaveManagement/>
  

  
      default:
        return <RoomRequests />;
    }
  };
  

  const NavLink = ({ tab, icon, label }) => (
    <button
      className={`admin-sidebar-link ${
        activeTab === tab ? "active" : ""
      }`}
      onClick={() => setActiveTab(tab)}
    >
      <Icon path={icon} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="admin-dashboard">
      {/* ---------- SIDEBAR ---------- */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Cube Hostels</h2>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink
            tab="roomRequests"
            icon={ICONS.roomRequests}
            label="Room Requests"
          />
          <NavLink
            tab="studentProfiles"
            icon={ICONS.studentProfiles}
            label="Student Profiles"
          />
          <NavLink
            tab="feedback"
            icon={ICONS.feedback}
            label="Feedback"
          />
          <NavLink
            tab="LeaveManagement"
            icon={ICONS.leaveApplications}
            label="Leave Applications"
          />
          <NavLink
            tab="vacantRooms"
            icon={ICONS.vacantRooms}
            label="Vacant Rooms"
          />
          <NavLink
            tab="AdminAnnouncements"
            icon={ICONS.vacantRooms}
            label="Announcements"
          />
          <NavLink
            tab="AdminMenuUpdate"
            icon={ICONS.vacantRooms}
            label="Food Menu"
          />
          <NavLink
            tab="AdminRulesUpdate"
            icon={ICONS.vacantRooms}
            label="Hostel Rules"
          />
        </nav>
      </aside>

      {/* ---------- MAIN CONTENT ---------- */}
      <div className="admin-content-wrapper">
        <header className="admin-content-header">
          <h1>Admin Dashboard</h1>
        </header>

        <main className="admin-tab-content">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
