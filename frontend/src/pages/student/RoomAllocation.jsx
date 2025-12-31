import React, { useEffect, useMemo, useState } from "react";
import HostelSelector from "../../components/HostelSelector";
import FloorSelector from "../../components/FloorSelector";
import RoomGrid from "../../components/RoomGrid";
import "../../styles/RoomAllocation.css";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../../context/AuthContext";




/* ---------- Icons ---------- */
const Icon = ({ path, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`icon ${className}`}>
    <path fillRule="evenodd" clipRule="evenodd" d={path} />
  </svg>
);

const ICONS = {
  user: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z",
  building:
    "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2h-1.528A6 6 0 004 9.528V4z",
  upload:
    "M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 3a1 1 0 112 0v7l1.293-1.293a1 1 0 111.414 1.414l-3 3-3-3a1 1 0 111.414-1.414L9 10V3z",
  check:
    "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
};

/* ---------- Constants ---------- */
const HOSTELS = ["Dheeran", "Valluvar", "Ponnar", "Sankar", "Elango", "Kamban", "Bharathi"];
const FLOORS = ["Ground", "First", "Second", "Third"];

const genRooms = (floor) => {
  if (floor === "Ground") {
    return Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(3, "0"));
  }
  const start = floor === "First" ? 101 : floor === "Second" ? 201 : 301;
  return Array.from({ length: 40 }, (_, i) => String(start + i));
};

/* ---------- Component ---------- */
export default function StudentRoomAllocation() {
  const { user, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    name: "",
    regNo: "",
    department: "",
    feesStatus: "Paid",
    hostel: HOSTELS[0],
    floor: FLOORS[0],
  });

  const [receipt, setReceipt] = useState(null);
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  /* ✅ NEW STATES */
  const [existingAllocation, setExistingAllocation] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const rooms = useMemo(() => genRooms(form.floor), [form.floor]);

  /* ✅ CHECK IF STUDENT ALREADY APPLIED */
  useEffect(() => {
    if (loading) return;
    if (!user?.email) return;
  
    const checkAllocation = async () => {
      setLoadingStatus(true);
  
      const { data, error } = await supabase
        .from("allocations")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();
  
      if (data) {
        setExistingAllocation(data);
      }
  
      setLoadingStatus(false);
    };
  
    checkAllocation();
  }, [user, loading]);

  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);
  
  

  /* ---------- Handlers ---------- */
  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleFileChange = (e) => {
    setReceipt(e.target.files[0]);
    setErrors({ ...errors, receipt: "" });
  };

  const validateForm = () => {
    const err = {};
    if (!form.name) err.name = "Name is required";
    if (!form.regNo) err.regNo = "Registration number is required";
    if (!form.department) err.department = "Department is required";
    if (!receipt) err.receipt = "Receipt upload is required";
    if (!selected) err.bed = "Please select a bed";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { roomNo, bedIndex } = selected;

      const { error } = await supabase.from("allocations").insert({
        email: form.email,
        name: form.name,
        reg_no: form.regNo,
        department: form.department,
        fees_status: form.feesStatus,
        hostel: form.hostel,
        floor: form.floor,
        room_number: roomNo,
        bed_number: bedIndex + 1,
        status: "pending",
      });

      if (error) throw error;

      setShowConfirmation(true);
      setExistingAllocation({ ...form, room_number: roomNo, bed_number: bedIndex + 1, status: "pending" });
    } catch (err) {
      alert("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- STATUS VIEW ---------- */
  if (loadingStatus) {
    return <div className="allocation-page">Checking application status…</div>;
  }

  if (existingAllocation) {
    return (
      <div className="allocation-page">
        <div className="allocation-card">
          <div className="allocation-header">
            <h2>Application Status</h2>
            <p>Your room allocation request</p>
          </div>

          <div className="status-body">
            <div className={`status-badge status-${existingAllocation.status}`}>
              {existingAllocation.status.toUpperCase()}
            </div>

            <div className="allocation-details">
              <div className="detail-row"><span>Email</span><span>{existingAllocation.email}</span></div>
              <div className="detail-row"><span>Name</span><span>{existingAllocation.name}</span></div>
              <div className="detail-row"><span>Reg No</span><span>{existingAllocation.reg_no}</span></div>
              <div className="detail-row"><span>Hostel</span><span>{existingAllocation.hostel}</span></div>
              <div className="detail-row"><span>Room</span><span>{existingAllocation.room_number}</span></div>
              <div className="detail-row"><span>Bed</span><span>{existingAllocation.bed_number}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  /* ---------- UI ---------- */
  return (
    <div className="allocation-page">
      <div className="allocation-card">
        <div className="allocation-header">
          <h2>Room Allocation Form</h2>
          <p>Complete your details and select a room.</p>
        </div>

        <form onSubmit={handleSubmit} className="allocation-form">
          {/* Student Details */}
          <div className="form-section-title">
            <Icon path={ICONS.user} className="section-icon" />
            Student Details
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Email</label>
              <input
                 name="email"
                 value={form.email}
                 readOnly
                 className="input-readonly"
              />

            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Registration Number *</label>
              <input
                name="regNo"
                value={form.regNo}
                onChange={onChange}
                className={errors.regNo ? "input-error" : ""}
              />
              {errors.regNo && (
                <span className="error-text">{errors.regNo}</span>
              )}
            </div>

            <div className="form-group">
              <label>Department *</label>
              <select
                name="department"
                value={form.department}
                onChange={onChange}
                className={errors.department ? "input-error" : ""}
              >
                <option value="">Select Department</option>
                <option>Computer Science</option>
                <option>Information Technology</option>
                <option>Mechanical Engineering</option>
                <option>Civil Engineering</option>
              </select>
              {errors.department && (
                <span className="error-text">{errors.department}</span>
              )}
            </div>
          </div>

          <div className="form-divider" />

          {/* Room Preference */}
          <div className="form-section-title">
            <Icon path={ICONS.building} className="section-icon" />
            Room Preference
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Select Hostel</label>
              <HostelSelector
                value={form.hostel}
                onChange={(v) => setForm({ ...form, hostel: v })}
              />
            </div>

            <div className="form-group">
              <label>Select Floor</label>
              <FloorSelector
                value={form.floor}
                onChange={(v) => setForm({ ...form, floor: v })}
              />
            </div>
          </div>

          <div className="form-divider" />

          {/* Upload */}
          <div className="form-group full-width">
            <label className="file-upload-label">
              Upload Fees Receipt *
            </label>
            <div className="file-input-wrapper">
              <label className="file-custom-btn">
                <Icon path={ICONS.upload} className="btn-icon" />
                Choose File
                <input type="file" hidden onChange={handleFileChange} />
              </label>
              <span className="file-name">
                {receipt ? receipt.name : "No file selected"}
              </span>
            </div>
            {errors.receipt && (
              <span className="error-text">{errors.receipt}</span>
            )}
          </div>

          <div className="form-divider" />

          {/* Room Grid */}
          <div className="form-group full-width">
            <label className="grid-label">
              Select Bed ({form.hostel} – {form.floor})
            </label>

            <RoomGrid
              hostel={form.hostel}
              floor={form.floor}
              rooms={rooms}
              getBeds={() => [false, false, false, false]}
              selected={selected}
              onSelectFreeBed={(roomNo, bedIndex) =>
                setSelected({ roomNo, bedIndex })
              }
            />

            {errors.bed && (
              <span className="error-text center-text">{errors.bed}</span>
            )}
          </div>

          <button
            type="submit"
            className="submit-btn primary-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-small"></span>
                Processing...
              </>
            ) : (
              "Complete Allocation"
            )}
          </button>
        </form>

        {/* Success Modal */}
        {showConfirmation && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <div className="modal-header">
                <h3>Application Submitted</h3>
              </div>
              <div className="modal-body">
                <div className="success-icon">
                  <Icon path={ICONS.check} />
                </div>
                <p>Your room allocation request is under review.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
