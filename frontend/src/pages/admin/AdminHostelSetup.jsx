import React, { useState } from "react";
import "../../styles/AdminSetup.css"; 

const HOSTELS = ["Hostel 1", "Hostel 2", "Hostel 3", "Hostel 4", "Hostel 5", "Hostel 6", "Hostel 7"];

export default function AdminHostelSetup() {
  const [data, setData] = useState({ 
    hostel: HOSTELS[0], 
    rooms: 40, 
    open: "", 
    close: "" 
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // 1. Basic Validation
    if (!data.open || !data.close) {
      alert("⚠️ Please set both open and close times.");
      return;
    }

    setLoading(true);
    try {
      // 2. Fetch call to the backend
      const res = await fetch("http://localhost:5000/api/allocation/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostel: data.hostel,
          roomsPerFloor: data.rooms,
          openTime: data.open,
          closeTime: data.close
        })
      });

      const result = await res.json();

      if (res.ok) {
        // 3. Success Case
        alert(`✅ Configuration for ${data.hostel} is now LIVE!`);
      } else {
        // 4. Detailed Error Case (Shows Supabase/Backend specific errors)
        alert(`❌ Database Error: ${result.error || "Failed to save"}\nDetail: ${result.details || "Check server console"}`);
        console.error("Full Error Context:", result);
      }
    } catch (err) {
      // 5. Network Error Case
      alert("❌ Network Error: Make sure your backend server is running on port 5000.");
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-setup-container">
      <div className="admin-setup-card">
        <div className="setup-header">
          <h2>Hostel Session Control</h2>
          <p className="subtitle">Configure room counts and booking window</p>
        </div>
        
        <hr className="divider" />

        <div className="form-group">
          <label>Select Hostel</label>
          <select 
            value={data.hostel} 
            onChange={e => setData({...data, hostel: e.target.value})}
            className="setup-input"
          >
            {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Rooms Per Floor</label>
          <input 
            type="number" 
            value={data.rooms} 
            placeholder="Default is 40"
            onChange={e => setData({...data, rooms: e.target.value})} 
            className="setup-input"
          />
          <small className="help-text">
            Generates: Ground (001-0{data.rooms}), First (101-1{data.rooms}), etc.
          </small>
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Booking Start Time</label>
            <input 
              type="datetime-local" 
              onChange={e => setData({...data, open: e.target.value})} 
              className="setup-input"
            />
          </div>
          
          <div className="form-group">
            <label>Booking End Time</label>
            <input 
              type="datetime-local" 
              onChange={e => setData({...data, close: e.target.value})} 
              className="setup-input"
            />
          </div>
        </div>
        
        <button 
          className="activate-btn" 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? "Saving Configuration..." : "Activate Allocation Session"}
        </button>
      </div>
    </div>
  );
}