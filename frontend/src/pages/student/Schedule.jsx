import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase"; 
import "../../styles/Schedule.css";

// --- Icons (Kept exactly the same) ---
const Icon = ({ path, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`icon ${className}`}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const MealIcon = ({ type }) => {
  switch(type) {
    case 'Morning': return <span className="meal-icon">☕</span>;
    case 'Breakfast': return <span className="meal-icon">🍳</span>;
    case 'Lunch': return <span className="meal-icon">🍱</span>;
    case 'Evening': return <span className="meal-icon">🍵</span>;
    case 'Dinner': return <span className="meal-icon">🍽️</span>;
    default: return null;
  }
};

export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [weeklyMenu, setWeeklyMenu] = useState(null); // Initialize as null to show loading
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetchWeeklyMenu();
  }, []);

  const fetchWeeklyMenu = async () => {
    try {
      const { data, error } = await supabase
        .from("weekly_menu")
        .select("*");

      if (error) throw error;

      // Transform array from DB into the Object format your UI expects
      // The DB returns: [{day: 'Monday', breakfast: '...'}, ...]
      // We convert to: { Monday: { breakfast: '...' }, ... }
      const formattedMenu = {};
      
      data.forEach(item => {
        formattedMenu[item.day] = {
          // .split(',') converts "Coffee, Tea" string back into ["Coffee", "Tea"] array for the map() function
          morning: item.morning ? item.morning.split(',').map(s => s.trim()) : [],
          breakfast: item.breakfast,
          lunch: item.lunch,
          evening: item.evening ? item.evening.split(',').map(s => s.trim()) : [],
          dinner: item.dinner
        };
      });

      setWeeklyMenu(formattedMenu);
    } catch (error) {
      console.error("Error fetching menu:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Loading State
  if (loading) {
    return (
      <div className="schedule-page">
        <div style={{ textAlign: "center", marginTop: "50px", fontSize: "1.2rem", color: "#2c5282" }}>
          Loading Menu...
        </div>
      </div>
    );
  }

  // 🔹 Error Fallback (if DB is empty)
  if (!weeklyMenu || !weeklyMenu[selectedDay]) {
    return <div className="schedule-page">Menu data not found.</div>;
  }

  return (
    <div className="schedule-page">
      <div className="schedule-card">
        <div className="schedule-header">
          <h2>Weekly Food Menu</h2>
          <p>Delicious Tamil Nadu vegetarian meals prepared daily with authentic flavors.</p>
        </div>

        <div className="days-selector">
          {daysOfWeek.map(day => (
            <button
              key={day}
              className={`day-btn ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day.substring(0, 3)} 
              <span className="full-day-name">{day.substring(3)}</span>
            </button>
          ))}
        </div>

        <div className="menu-content">
          <h3 className="day-heading">{selectedDay}'s Menu</h3>
          
          <div className="timeline-container">
            {/* Morning */}
            <div className="meal-card">
              <div className="meal-header">
                <div className="meal-title">
                  <MealIcon type="Morning" />
                  <span>Morning Beverages</span>
                </div>
                <span className="meal-time">6:30 AM - 7:30 AM</span>
              </div>
              <div className="meal-items-tags">
                {weeklyMenu[selectedDay].morning.map((item, i) => (
                  <span key={i} className="food-tag">{item}</span>
                ))}
              </div>
            </div>

            {/* Breakfast */}
            <div className="meal-card">
              <div className="meal-header">
                <div className="meal-title">
                  <MealIcon type="Breakfast" />
                  <span>Breakfast</span>
                </div>
                <span className="meal-time">8:00 AM - 9:30 AM</span>
              </div>
              <p className="meal-description">{weeklyMenu[selectedDay].breakfast}</p>
            </div>

            {/* Lunch */}
            <div className="meal-card">
              <div className="meal-header">
                <div className="meal-title">
                  <MealIcon type="Lunch" />
                  <span>Lunch</span>
                </div>
                <span className="meal-time">12:30 PM - 2:00 PM</span>
              </div>
              <p className="meal-description">{weeklyMenu[selectedDay].lunch}</p>
            </div>

            {/* Evening */}
            <div className="meal-card">
              <div className="meal-header">
                <div className="meal-title">
                  <MealIcon type="Evening" />
                  <span>Evening Beverages</span>
                </div>
                <span className="meal-time">4:30 PM - 5:30 PM</span>
              </div>
              <div className="meal-items-tags">
                {weeklyMenu[selectedDay].evening.map((item, i) => (
                  <span key={i} className="food-tag">{item}</span>
                ))}
              </div>
            </div>

            {/* Dinner */}
            <div className="meal-card">
              <div className="meal-header">
                <div className="meal-title">
                  <MealIcon type="Dinner" />
                  <span>Dinner</span>
                </div>
                <span className="meal-time">7:30 PM - 9:00 PM</span>
              </div>
              <p className="meal-description">{weeklyMenu[selectedDay].dinner}</p>
            </div>
          </div>
        </div>

        <div className="weekly-overview">
          <h3 className="overview-title">Quick Weekly Overview</h3>
          <div className="week-grid">
            {daysOfWeek.map(day => (
              <div 
                key={day} 
                className={`day-card-mini ${selectedDay === day ? 'highlight' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <h4>{day}</h4>
                <div className="mini-menu-item">
                  <span>🍳</span> {weeklyMenu[day]?.breakfast?.split(',')[0]}...
                </div>
                <div className="mini-menu-item">
                  <span>🍱</span> {weeklyMenu[day]?.lunch?.split(',')[0]}...
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}