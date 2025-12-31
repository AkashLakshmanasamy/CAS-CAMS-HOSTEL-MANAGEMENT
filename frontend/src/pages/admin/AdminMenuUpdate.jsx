import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/Schedule.css"; // Reusing your existing styles for consistency

export default function AdminMenuUpdate() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // State for the form inputs
  const [menuData, setMenuData] = useState({
    morning: "",
    breakfast: "",
    lunch: "",
    evening: "",
    dinner: ""
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Fetch menu for the selected day
  useEffect(() => {
    fetchMenu(selectedDay);
  }, [selectedDay]);

  const fetchMenu = async (day) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("weekly_menu")
      .select("*")
      .eq("day", day)
      .single();

    if (error) {
      console.error("Error fetching menu:", error);
    } else if (data) {
      setMenuData({
        morning: data.morning || "",
        breakfast: data.breakfast || "",
        lunch: data.lunch || "",
        evening: data.evening || "",
        dinner: data.dinner || ""
      });
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMenuData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("weekly_menu")
      .update(menuData)
      .eq("day", selectedDay);

    if (error) {
      setMessage("❌ Failed to update menu.");
    } else {
      setMessage("✅ Menu updated successfully!");
    }
    setLoading(false);
  };

  return (
    <div className="schedule-page">
      <div className="schedule-card">
        <div className="schedule-header" style={{ background: "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)" }}>
          <h2>🍽️ Admin Menu Manager</h2>
          <p>Update the food schedule for the students.</p>
        </div>

        {/* Day Selector */}
        <div className="days-selector">
          {daysOfWeek.map(day => (
            <button
              key={day}
              className={`day-btn ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Edit Form */}
        <div className="menu-content">
          <h3 className="day-heading">Editing: {selectedDay}</h3>

          {message && <div style={{ textAlign: "center", marginBottom: "20px", color: message.includes("✅") ? "green" : "red" }}>{message}</div>}

          <form onSubmit={handleUpdate} className="timeline-container">
            
            {/* Morning */}
            <div className="meal-card">
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>☕ Morning (Comma separated)</label>
              <input 
                type="text" 
                name="morning" 
                value={menuData.morning} 
                onChange={handleInputChange} 
                className="input-field"
                placeholder="e.g. Coffee, Milk"
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
              />
            </div>

            {/* Breakfast */}
            <div className="meal-card">
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>🍳 Breakfast</label>
              <textarea 
                name="breakfast" 
                value={menuData.breakfast} 
                onChange={handleInputChange} 
                rows="2"
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
              />
            </div>

            {/* Lunch */}
            <div className="meal-card">
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>🍱 Lunch</label>
              <textarea 
                name="lunch" 
                value={menuData.lunch} 
                onChange={handleInputChange} 
                rows="2"
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
              />
            </div>

            {/* Evening */}
            <div className="meal-card">
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>🍵 Evening (Comma separated)</label>
              <input 
                type="text" 
                name="evening" 
                value={menuData.evening} 
                onChange={handleInputChange} 
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
              />
            </div>

            {/* Dinner */}
            <div className="meal-card">
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>🍽️ Dinner</label>
              <textarea 
                name="dinner" 
                value={menuData.dinner} 
                onChange={handleInputChange} 
                rows="2"
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                marginTop: "20px", 
                padding: "15px", 
                background: "#2c5282", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                fontSize: "1.1rem", 
                cursor: "pointer",
                width: "100%"
              }}
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}