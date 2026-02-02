import React, { useEffect, useMemo, useState, useCallback } from "react";
import HostelSelector from "../../components/HostelSelector";
import FloorSelector from "../../components/FloorSelector";
import RoomGrid from "../../components/RoomGrid";
import "../../styles/RoomAllocation.css";
import { useAuth } from "../../context/AuthContext";

/* ---------- Icons ---------- */
const Icon = ({ path, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`icon ${className}`}>
    <path fillRule="evenodd" clipRule="evenodd" d={path} />
  </svg>
);

const ICONS = {
  user: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z",
  building: "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2h-1.528A6 6 0 004 9.528V4z",
  upload: "M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 3a1 1 0 112 0v7l1.293-1.293a1 1 0 111.414 1.414l-3 3-3-3a1 1 0 111.414-1.414L9 10V3z",
  check: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
};

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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [existingAllocation, setExistingAllocation] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [occupiedBeds, setOccupiedBeds] = useState([]);

  const rooms = useMemo(() => genRooms(form.floor), [form.floor]);

  // FETCH OCCUPIED BEDS FROM BACKEND
  useEffect(() => {
    const fetchOccupied = async () => {
      try {
        const res = await fetch(`${API_BASE}/occupied?hostel=${form.hostel}&floor=${form.floor}`);
        const data = await res.json();
        setOccupiedBeds(data || []);
      } catch (err) { console.error(err); }
    };
    fetchOccupied();
  }, [form.hostel, form.floor]);

  // CHECK IF USER ALREADY APPLIED
  useEffect(() => {
    if (!loading && user?.email) {
      setForm(prev => ({ ...prev, email: user.email }));
      const checkStatus = async () => {
        setLoadingStatus(true);
        try {
          const res = await fetch(`${API_BASE}/status?email=${user.email}`);
          const data = await res.json();
          if (data.allocation) setExistingAllocation(data.allocation);
        } catch (err) { console.error(err); }
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
    const err = {};
    if (!form.name || !form.regNo || !form.department || !receipt || !selected) {
      alert("Please fill all fields and select a bed."); return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    formData.append("receipt", receipt);
    formData.append("roomNumber", selected.roomNo);
    formData.append("bedNumber", selected.bedIndex + 1);

    try {
      const res = await fetch(API_BASE, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setShowConfirmation(true);
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
          <div className="allocation-header"><h2>Application Status</h2></div>
          <div className="status-body">
            <div className={`status-badge status-${existingAllocation.status}`}>{existingAllocation.status.toUpperCase()}</div>
            <div className="allocation-details">
              <div className="detail-row"><span>Name</span><span>{existingAllocation.name}</span></div>
              <div className="detail-row"><span>Hostel</span><span>{existingAllocation.hostel}</span></div>
              <div className="detail-row"><span>Room/Bed</span><span>{existingAllocation.room_number} / Bed {existingAllocation.bed_number}</span></div>
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
            <div className="form-group"><label>Name</label><input name="name" onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
            <div className="form-group"><label>Reg No</label><input name="regNo" onChange={(e) => setForm({...form, regNo: e.target.value})} required /></div>
            <div className="form-group"><label>Dept</label><input name="department" onChange={(e) => setForm({...form, department: e.target.value})} required /></div>
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
            <label className="file-upload-label">Upload Receipt</label>
            <input type="file" onChange={(e) => setReceipt(e.target.files[0])} required />
          </div>
          <RoomGrid
            hostel={form.hostel} floor={form.floor} rooms={rooms} getBeds={getBedStatus}
            selected={selected} onSelectFreeBed={(roomNo, bedIndex) => setSelected({ roomNo, bedIndex })}
          />
          <button type="submit" className="submit-btn primary-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Complete Allocation"}
          </button>
        </form>
      </div>
    </div>
  );
}