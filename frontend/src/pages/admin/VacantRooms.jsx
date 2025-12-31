// src/components/admin/VacantRooms.jsx

import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase"; 
import "../../styles/VacantRooms-new.css"; 

export default function VacantRooms() {
  // 1. Constants matching your working file
  const HOSTELS = ["Hostel 1", "Hostel 2", "Hostel 3", "Hostel 4", "Hostel 5", "Hostel 6", "Hostel 7"];
  const FLOORS = ["Ground", "First", "Second", "Third"];

  // 2. Default state set to first item
  const [hostel, setHostel] = useState(HOSTELS[0]); 
  const [floor, setFloor] = useState(FLOORS[0]);
  
  const [allocations, setAllocations] = useState([]); 
  const [loading, setLoading] = useState(false);

  // 3. Room Generation (Matches Student Logic - Strings with Padding)
  const getRoomNumbers = (selectedFloor) => {
    if (selectedFloor === "Ground") {
      // Returns ["001", "002", ... "040"]
      return Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(3, "0"));
    }
    
    let start = 101;
    if (selectedFloor === "First") start = 101;
    else if (selectedFloor === "Second") start = 201;
    else if (selectedFloor === "Third") start = 301;
    
    // Returns ["101", "102"...]
    return Array.from({ length: 40 }, (_, i) => String(start + i));
  };

  const roomNumbers = getRoomNumbers(floor);

  // 4. Fetch Data
  useEffect(() => {
    fetchAllocations();
  }, [hostel, floor]);

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("allocations")
        .select("room_number, bed_number, status") 
        .eq("hostel", hostel)
        .eq("floor", floor)
        // Don't show rejected applications as occupied
        .neq("status", "rejected"); 

      if (error) throw error;
      
      setAllocations(data || []);
    } catch (err) {
      console.error("Error fetching vacant rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  // 5. Check Logic
  const isBedBooked = (currentRoomNo, bedIndex) => {
    const currentBedNumber = bedIndex + 1; // 1, 2, 3

    return allocations.some((alloc) => {
        const dbRoom = String(alloc.room_number);
        const dbBed = Number(alloc.bed_number);
        
        return dbRoom === currentRoomNo && dbBed === currentBedNumber;
    });
  };

  return (
    <div className="vacant-container">
      <div className="vacant-header">
        <div className="header-title">
          <h2>Vacant Rooms</h2>
          <p>Live status of {hostel} - {floor} Floor</p>
        </div>

        <div className="filter-group">
          <select value={hostel} onChange={(e) => setHostel(e.target.value)} className="custom-select">
            {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
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
            
            // ✅ CHANGED HERE: Loop only [0, 1, 2] for 3 Beds
            const bedStatus = [0, 1, 2].map(bedIdx => {
              return isBedBooked(roomNo, bedIdx);
            });

            return (
              <div key={roomNo} className="room-card">
                <div className="room-number">{roomNo}</div>
                
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