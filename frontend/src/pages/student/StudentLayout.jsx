import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import "../../styles/StudentLayout.css" // Make sure this path points to your Navbar

export default function StudentLayout() {
  return (
    <div className="student-layout">
      {/* 1. The Navbar sits at the top */}
      <Navbar />

      {/* 2. The <Outlet /> is a placeholder. 
          React Router will swap this out with whatever page 
          the user is visiting (Dashboard, Profile, Feedback, etc.) 
      */}
      <main className="student-content">
        <Outlet />
      </main>
    </div>
  );
}