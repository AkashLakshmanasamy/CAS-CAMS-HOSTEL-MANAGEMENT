import React, { useEffect, useState } from "react";
import "../../styles/VacantRooms-new.css"; 

const API_BASE_URL = "http://localhost:5000/api/room/allocations";

export default function VacantRooms() {
    const HOSTELS = ["Hostel 1", "Hostel 2", "Hostel 3", "Hostel 4", "Hostel 5", "Hostel 6", "Hostel 7"];
    const FLOORS = ["Ground", "First", "Second", "Third"];

    const [hostel, setHostel] = useState(HOSTELS[0]); 
    const [floor, setFloor] = useState(FLOORS[0]);
    const [allocations, setAllocations] = useState([]); 
    const [loading, setLoading] = useState(false);

    const getRoomNumbers = (selectedFloor) => {
        if (selectedFloor === "Ground") {
            return Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(3, "0"));
        }
        let start = selectedFloor === "First" ? 101 : selectedFloor === "Second" ? 201 : 301;
        return Array.from({ length: 40 }, (_, i) => String(start + i));
    };

    const roomNumbers = getRoomNumbers(floor);

    useEffect(() => {
        fetchAllocations();
    }, [hostel, floor]);

    const fetchAllocations = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}?hostel=${encodeURIComponent(hostel)}&floor=${floor}`);
            if (!response.ok) throw new Error("Server error");
            
            const data = await response.json();
            setAllocations(data || []);
        } catch (err) {
            console.error("Error fetching vacant rooms:", err);
        } finally {
            setLoading(false);
        }
    };

    const isBedBooked = (currentRoomNo, bedIndex) => {
        const currentBedNumber = bedIndex + 1;
        return allocations.some((alloc) => {
            return String(alloc.room_number) === String(currentRoomNo) && 
                   Number(alloc.bed_number) === currentBedNumber;
        });
    };

    return (
        <div className="vacant-container">
            <div className="vacant-header">
                <div className="header-title">
                    <h2>Vacant Rooms</h2>
                    <p>Live status: {hostel} - {floor} Floor</p>
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
                    <div className="legend-item"><div className="legend-box free"></div><span>Available</span></div>
                    <div className="legend-item"><div className="legend-box occupied"></div><span>Occupied</span></div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Loading Room Status...</div>
            ) : (
                <div className="rooms-grid">
                    {roomNumbers.map((roomNo) => (
                        <div key={roomNo} className="room-card">
                            <div className="room-number">{roomNo}</div>
                            <div className="bed-row">
                                {/* UPDATED: Array changed to [0, 1, 2] for 3 beds */}
                                {[0, 1, 2].map(bedIdx => { 
                                    const isOccupied = isBedBooked(roomNo, bedIdx);
                                    return (
                                        <div
                                            key={bedIdx}
                                            className={`bed-box ${isOccupied ? "occupied" : "free"}`}
                                            title={isOccupied ? "Occupied" : `Bed ${bedIdx + 1}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}