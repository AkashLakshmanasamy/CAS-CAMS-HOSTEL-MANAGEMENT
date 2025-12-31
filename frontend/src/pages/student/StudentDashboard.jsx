import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../../context/AuthContext"; // ✅ Fixed import
import "../../styles/StudentDashboard.css"; 

// --- Icons (SVG Paths) ---
const Icon = ({ path, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`icon ${className}`}
  >
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  bed: "M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2v2a1 1 0 11-2 0v-2H6v2a1 1 0 11-2 0v-2a2 2 0 01-2-2v-2a2 2 0 100-4V6z",
  food: "M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM3.707 3.293a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM2 10a8 8 0 1016 0 8 8 0 00-16 0zm10 0q0 .588-.08 1.156l.08.01a3.003 3.003 0 012.822 2.001A6.007 6.007 0 0010 4a6.007 6.007 0 00-2.822 9.167 3.003 3.003 0 012.822-2.001L10 10z", 
  alert: "M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z",
  arrow: "M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
};

export default function StudentDashboard() {
  const { user } = useAuth(); // ✅ Using your AuthContext
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileName = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (data?.full_name) {
          setStudentName(data.full_name);
        }
      }
      setLoading(false);
    };

    fetchProfileName();
  }, [user]);

  // Fallback name logic
  const displayName = studentName || user?.email?.split("@")[0] || "Student";

  return (
    <div className="dashboard-container">
      {/* 1. Welcome Banner */}
      <header className="home-header">
        <div className="header-content">
          <h1>Welcome back, <span className="highlight">{displayName}</span>!</h1>
          <p>Everything looks good today. Check your updates below.</p>
        </div>
      </header>

      {/* 2. Quick Status Cards */}
      <div className="status-grid">
        
        {/* Card 1: Room Allocation (Linked to real route) */}
        <div className="status-card highlight-card" onClick={() => navigate("/room-allocation")}>
          <div className="card-icon-bg"><Icon path={ICONS.bed} /></div>
          <div className="card-info">
            <h3>Room Allocation</h3>
            <p>Phase 1 is Live</p>
            <span className="action-link">Book Now <Icon path={ICONS.arrow} /></span>
          </div>
        </div>

        {/* Card 2: Menu (Placeholder) */}
        <div className="status-card" onClick={() => navigate("/schedule")}>
          <div className="card-icon-bg secondary"><Icon path={ICONS.food} /></div>
          <div className="card-info">
            <h3>Today's Menu</h3>
            <p>Lunch: Veg Biryani</p>
            <span className="action-link">View Week <Icon path={ICONS.arrow} /></span>
          </div>
        </div>

        {/* Card 3: Notices (Placeholder) */}
        <div className="status-card" onClick={() => navigate("/rules")}>
          <div className="card-icon-bg warning"><Icon path={ICONS.alert} /></div>
          <div className="card-info">
            <h3>Notices</h3>
            <p>Curfew: 8:30 PM</p>
            <span className="action-link">Read Rules <Icon path={ICONS.arrow} /></span>
          </div>
        </div>
      </div>

      {/* 3. Notice Board Section (Simulated Data) */}
      <div className="dashboard-section">
        <h2>📢 Latest Announcements</h2>
        <div className="notice-list">
          <div className="notice-item">
            <div className="notice-date">27 DEC</div>
            <div className="notice-text">
              <strong>Hostel Fees Due</strong>
              <p>Last date for payment is extended to 5th Jan.</p>
            </div>
          </div>
          <div className="notice-item">
            <div className="notice-date">26 DEC</div>
            <div className="notice-text">
              <strong>Wi-Fi Maintenance</strong>
              <p>Server downtime expected between 2 PM - 4 PM today.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}