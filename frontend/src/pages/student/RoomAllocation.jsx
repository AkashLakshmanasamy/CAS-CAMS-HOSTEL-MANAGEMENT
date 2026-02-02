import React, { useEffect, useMemo, useState, useCallback } from "react";
import HostelSelector from "../../components/HostelSelector";
import FloorSelector from "../../components/FloorSelector";
import RoomGrid from "../../components/RoomGrid";
import "../../styles/RoomAllocation.css";
import { useAuth } from "../../context/AuthContext";

const HOSTELS = ["Hostel 1", "Hostel 2", "Hostel 3", "Hostel 4", "Hostel 5", "Hostel 6", "Hostel 7"];
const FLOORS = ["Ground", "First", "Second", "Third"];
const API_BASE = "http://localhost:5000/api/allocation";

const genRooms = (floor) => {
  if (floor === "Ground") return Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(3, "0"));
  const start = floor === "First" ? 101 : floor === "Second" ? 201 : 301;
  return Array.from({ length: 40 }, (_, i) => String(start + i));
};

export default function StudentRoomAllocation() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ email: "", name: "", regNo: "", department: "", feesStatus: "Paid", hostel: HOSTELS[0], floor: FLOORS[0] });
  const [receipt, setReceipt] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingAllocation, setExistingAllocation] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [occupiedBeds, setOccupiedBeds] = useState([]);

  const rooms = useMemo(() => genRooms(form.floor), [form.floor]);

  const safeFetch = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        return { data, ok: res.ok };
      }
      
      const htmlText = await res.text();
      console.error("Critical Error: Received HTML instead of JSON from:", url);
      console.error("Server Response:", htmlText);
      throw new Error("Server configuration error (404). Check backend routes.");
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const fetchOccupied = async () => {
      try {
        const { data } = await safeFetch(`${API_BASE}/occupied?hostel=${form.hostel}&floor=${form.floor}`);
        setOccupiedBeds(data || []);
      } catch (err) { 
        console.error("Occupied Fetch Error:", err.message); 
      }
    };
    fetchOccupied();
  }, [form.hostel, form.floor]);

  useEffect(() => {
    if (!loading && user?.email) {
      setForm(prev => ({ ...prev, email: user.email }));
      const checkStatus = async () => {
        setLoadingStatus(true);
        try {
          const { data } = await safeFetch(`${API_BASE}/status?email=${user.email}`);
          if (data && data.allocation) setExistingAllocation(data.allocation);
        } catch (err) { 
          console.error("Status Check Error:", err.message); 
        }
        setLoadingStatus(false);
      };
      checkStatus();
    }
  }, [user, loading]);

  const getBedStatus = useCallback((roomNo) => {
    const status = [false, false, false, false];
    occupiedBeds.filter(a => a.room_number === roomNo).forEach(a => {
      if (a.bed_number >= 1 && a.bed_number <= 4) status[a.bed_number - 1] = true;
    });
    return status;
  }, [occupiedBeds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.regNo || !form.department || !receipt || !selected) {
      alert("Please complete the form and select a bed."); return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    formData.append("receipt", receipt);
    formData.append("roomNumber", selected.roomNo);
    formData.append("bedNumber", selected.bedIndex + 1);

    try {
      const { data, ok } = await safeFetch(API_BASE, { method: "POST", body: formData });
      if (!ok) throw new Error(data.error || "Submission failed");
      
      alert("Application submitted successfully!");
      setExistingAllocation({ ...form, room_number: selected.roomNo, bed_number: selected.bedIndex + 1, status: "pending" });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingStatus) return <div className="allocation-page">Loading...</div>;

  if (existingAllocation) {
    return (
      <div className="allocation-page">
        <div className="allocation-card">
          <div className="allocation-header"><h2>Status: {existingAllocation.status?.toUpperCase()}</h2></div>
          <div className="status-body">
            <div className="allocation-details">
              <div className="detail-row"><span>Room</span><span>{existingAllocation.room_number}</span></div>
              <div className="detail-row"><span>Bed</span><span>{existingAllocation.bed_number}</span></div>
              <div className="detail-row"><span>Hostel</span><span>{existingAllocation.hostel}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="allocation-page">
      <div className="allocation-card">
        <div className="allocation-header"><h2>Room Allocation</h2></div>
        <form onSubmit={handleSubmit} className="allocation-form">
          <div className="form-grid">
            <div className="form-group"><label>Full Name</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
            <div className="form-group"><label>Reg No</label><input value={form.regNo} onChange={(e) => setForm({...form, regNo: e.target.value})} required /></div>
            <div className="form-group"><label>Dept</label><input value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} required /></div>
          </div>
          <div className="form-grid">
            <div className="form-group"><label>Hostel</label>
              <HostelSelector value={form.hostel} onChange={(v) => { setForm({...form, hostel: v}); setSelected(null); }} />
            </div>
            <div className="form-group"><label>Floor</label>
              <FloorSelector value={form.floor} onChange={(v) => { setForm({...form, floor: v}); setSelected(null); }} />
            </div>
          </div>
          <div className="form-group">
            <label className="file-upload-label">Payment Receipt</label>
            <input type="file" onChange={(e) => setReceipt(e.target.files[0])} required />
          </div>
          <RoomGrid
            hostel={form.hostel} floor={form.floor} rooms={rooms} getBeds={getBedStatus}
            selected={selected} onSelectFreeBed={(roomNo, bedIndex) => setSelected({ roomNo, bedIndex })}
          />
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Allocation"}
          </button>
        </form>
      </div>
    </div>
  );
}