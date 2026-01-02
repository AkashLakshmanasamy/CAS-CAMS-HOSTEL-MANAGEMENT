import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/AdminStyles.css"; // Using the unified Admin theme

// Simple Icon Component
const Icon = ({ path, className = "icon" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  save: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
  coffee: "M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z M18 9v3a1 1 0 01-1 1H3a1 1 0 01-1-1V9h16zM3 15a2 2 0 01-2-2v-1h18v1a2 2 0 01-2 2H3z", 
  sun: "M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h1a1 1 0 100 2h-1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z",
  moon: "M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
};

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
    <div className="admin-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>🍽️ Admin Menu Manager</h2>
          <p className="subtitle">Update the weekly food schedule for students.</p>
        </div>
      </div>

      {/* Main Grid: Days Selector (Left) vs Form (Right) */}
      <div className="grid-2" style={{ gridTemplateColumns: "250px 1fr", alignItems: "start" }}>
        
        {/* Left Column: Day Selector */}
        <div className="content-card">
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', color: '#374151' }}>Select Day</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {daysOfWeek.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 15px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  backgroundColor: selectedDay === day ? '#2c5282' : '#f3f4f6',
                  color: selectedDay === day ? 'white' : '#4b5563',
                  boxShadow: selectedDay === day ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="content-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0, color: '#111827' }}>Editing: <span style={{ color: '#2c5282' }}>{selectedDay}</span></h3>
            {message && (
              <span style={{ 
                fontSize: '0.9rem', 
                fontWeight: 600, 
                color: message.includes("✅") ? "#059669" : "#dc2626",
                backgroundColor: message.includes("✅") ? "#ecfdf5" : "#fef2f2",
                padding: "6px 12px",
                borderRadius: "20px"
              }}>
                {message}
              </span>
            )}
          </div>

          <form onSubmit={handleUpdate}>
            {/* Morning */}
            <div className="form-group">
              <label>☕ Morning (Drinks/Snacks)</label>
              <input 
                type="text" 
                name="morning" 
                value={menuData.morning} 
                onChange={handleInputChange} 
                className="input-field"
                placeholder="e.g. Coffee, Milk"
              />
            </div>

            {/* Breakfast */}
            <div className="form-group">
              <label>🍳 Breakfast</label>
              <textarea 
                name="breakfast" 
                value={menuData.breakfast} 
                onChange={handleInputChange} 
                className="input-area"
                rows="2"
              />
            </div>

            {/* Lunch */}
            <div className="form-group">
              <label>🍱 Lunch</label>
              <textarea 
                name="lunch" 
                value={menuData.lunch} 
                onChange={handleInputChange} 
                className="input-area"
                rows="2"
              />
            </div>

            {/* Evening */}
            <div className="form-group">
              <label>🍵 Evening (Drinks/Snacks)</label>
              <input 
                type="text" 
                name="evening" 
                value={menuData.evening} 
                onChange={handleInputChange} 
                className="input-field"
              />
            </div>

            {/* Dinner */}
            <div className="form-group">
              <label>🍽️ Dinner</label>
              <textarea 
                name="dinner" 
                value={menuData.dinner} 
                onChange={handleInputChange} 
                className="input-area"
                rows="2"
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
            >
              <Icon path={ICONS.save} />
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}