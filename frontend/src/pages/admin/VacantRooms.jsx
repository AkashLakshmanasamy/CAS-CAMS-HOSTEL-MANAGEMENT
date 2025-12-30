// src/components/admin/VacantRooms.jsx

import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase"; 
import "../../styles/VacantRooms-new.css"; 

export default function VacantRooms() {
  const [hostel, setHostel] = useState("Dheeran");
  const [floor, setFloor] = useState("Ground");
  const [allocations, setAllocations] = useState([]); 
  const [loading, setLoading] = useState(false);

  // ⚠️ NOTE: Indha spelling DB la irukura mariye irukanum (Case Sensitive)
  const HOSTELS = ["Dheeran", "Valluvar", "Ponnar", "Sankar", "Elango"];
  const FLOORS = ["Ground", "First", "Second", "Third"];

  // 1. Generate Room Numbers
  const getRoomNumbers = (selectedFloor) => {
    let start = 0;
    if (selectedFloor === "Ground") start = 1;
    else if (selectedFloor === "First") start = 101;
    else if (selectedFloor === "Second") start = 201;
    else if (selectedFloor === "Third") start = 301;
    return Array.from({ length: 40 }, (_, i) => start + i);
  };

  const roomNumbers = getRoomNumbers(floor);

  // 2. Fetch Data
  useEffect(() => {
    fetchAllocations();
  }, [hostel, floor]);

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      console.log(`Fetching for Hostel: ${hostel}, Floor: ${floor}`); // Debugging Log

      const { data, error } = await supabase
        .from("allocations")
        .select("room_number, bed_number, status") 
        .eq("hostel", hostel)
        .eq("floor", floor);

      if (error) throw error;
      
      console.log("🔥 Data from DB:", data); // Check this in Console!
      setAllocations(data || []);
    } catch (err) {
      console.error("Error fetching vacant rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. ✅ UPDATED STRONG CHECK LOGIC
  const isBedBooked = (roomNo, bedIndex) => {
    const currentBedNumber = bedIndex + 1; // 1, 2, 3
    
    // Convert Loop Number to String variants (Eg: "1" and "001")
    const loopRoomStr = roomNo.toString(); 
    const loopRoomPadded = roomNo.toString().padStart(3, '0');

    return allocations.some((alloc) => {
        if (!alloc.room_number) return false; // Safety check

        // DB Data Cleanup (Convert to string & trim spaces)
        const dbRoom = String(alloc.room_number).trim();
        const dbBed = Number(alloc.bed_number); 
        const dbStatus = alloc.status ? alloc.status.toLowerCase() : "";

        // CHECK 1: Room Number Match (Matches "1" OR "001")
        const isRoomMatch = (dbRoom === loopRoomStr || dbRoom === loopRoomPadded);
        
        // CHECK 2: Bed Number Match
        const isBedMatch = (dbBed === currentBedNumber);

        // CHECK 3: Status Match (Active bookings only)
        const isStatusMatch = (dbStatus === "confirmed" || dbStatus === "pending" || dbStatus === "approved");

        return isRoomMatch && isBedMatch && isStatusMatch;
    });
  };

  return (
    <div className="vacant-container">
      <div className="vacant-header">
        <div className="header-title">
          <h2>Vacant Rooms</h2>
          <p>Live status of {hostel} Hostel - {floor} Floor</p>
        </div>

        <div className="filter-group">
          <select value={hostel} onChange={(e) => setHostel(e.target.value)} className="custom-select">
            {HOSTELS.map(h => <option key={h} value={h}>{h} Hostel</option>)}
          </select>
          <select value={floor} onChange={(e) => setFloor(e.target.value)} className="custom-select">
            {FLOORS.map(f => <option key={f} value={f}>{f} Floor</option>)}
          </select>
        </div>

        <div className="legend">
          <div className="legend-item">
            <div className="legend-box free"></div> 
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-box occupied"></div> 
            <span>Occupied</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading Room Status...</div>
      ) : (
        <div className="rooms-grid">
          {roomNumbers.map((roomNo) => {
            
            // Checking 3 Beds only
            const bedStatus = [0, 1, 2].map(bedIdx => {
              return isBedBooked(roomNo, bedIdx);
            });

            return (
              <div key={roomNo} className="room-card">
                {/* Display as "001" but logic handles "1" too */}
                <div className="room-number">
                    {roomNo.toString().padStart(3, '0')}
                </div>
                
                <div className="bed-row">
                  {bedStatus.map((isOccupied, index) => (
                    <div
                      key={index}
                      className={`bed-box ${isOccupied ? "occupied" : "free"}`}
                      title={isOccupied ? "Occupied" : `Bed ${index + 1}`}
                    >
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}