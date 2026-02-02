import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; 
import "../../styles/LeaveApplication.css";

// --- Icons (SVG paths remain same) ---
const Icon = ({ path, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`icon ${className}`}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  user: "M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z",
  calendar: "M5.25 2.25a.75.75 0 00-1.5 0v1.5h-1.5a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25v-10.5a2.25 2.25 0 00-2.25-2.25h-1.5v-1.5a.75.75 0 00-1.5 0v1.5h-6v-1.5z",
  phone: "M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z",
  upload: "M9.97 4.97a.75.75 0 011.06 0l3 3a.75.75 0 01-1.06 1.06l-1.72-1.72v7.94a.75.75 0 01-1.5 0v-7.94L8.97 9.03a.75.75 0 01-1.06-1.06l3-3zM3.75 12.75A.75.75 0 013 12V8.75a.75.75 0 011.5 0V12a.75.75 0 01-.75.75z",
  send: "M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z",
  check: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
  history: "M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z",
  print: "M7.25 10.25a.75.75 0 00-1.5 0v6.5a.75.75 0 00.75.75h7a.75.75 0 00.75-.75v-6.5a.75.75 0 00-1.5 0v5h-5.5v-5zM6 6.75A.75.75 0 016.75 6h6.5a.75.75 0 01.75.75v3.5a.75.75 0 01-.75.75h-6.5A.75.75 0 016 10.25v-3.5z"
};

const API_BASE_URL = "http://localhost:5000/api/leave";

export default function LeaveApplication() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("new");
  
  const [formData, setFormData] = useState({
    name: "", rollNumber: "", branch: "", year: "", semester: "",
    hostelName: "", roomNumber: "", date: "", time: "", reason: "",
    studentMobile: "", parentMobile: "", informedAdvisor: "no",
    advisorName: "", advisorMobile: "", studentSignature: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const studentSignatureRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'history' && user?.email) {
      fetchHistory();
    }
  }, [activeTab, user]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // --- REFACTORED TO USE BACKEND API ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) return alert("Please log in.");
    setLoading(true);

    try {
      const data = new FormData();
      // Append all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'studentSignature') data.append(key, formData[key]);
      });
      
      // Append file and user info
      data.append("studentSignature", formData.studentSignature);
      data.append("email", user.email);
      data.append("userId", user.id);

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        body: data, // FormData sets correct Multipart/form-data header automatically
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Submission failed");

      setSubmitted(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}?email=${user.email}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setHistoryData(result.history || []);
    } catch (err) {
      console.error("History error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", rollNumber: "", branch: "", year: "", semester: "",
      hostelName: "", roomNumber: "", date: "", time: "", reason: "",
      studentMobile: "", parentMobile: "", informedAdvisor: "no",
      advisorName: "", advisorMobile: "", studentSignature: null,
    });
    if (studentSignatureRef.current) studentSignatureRef.current.value = "";
    setSubmitted(false);
    setActiveTab("new");
  };

  if (viewTicket) {
    return (
      <div className="ticket-modal-backdrop">
        <div className="ticket-modal">
          <div className="ticket-header">
            <h3>HOSTEL PERMISSION PASS</h3>
            <button className="close-ticket-btn" onClick={() => setViewTicket(null)}>&times;</button>
          </div>
          <div className="ticket-content printable-area">
            <div className="ticket-row header-row">
              <div><strong>ID:</strong> #{viewTicket.id}</div>
              <div className={`ticket-status ${viewTicket.status?.toLowerCase()}`}>
                {viewTicket.status?.toUpperCase()} {viewTicket.status === 'Approved' ? '✅' : '⏳'}
              </div>
            </div>
            <div className="ticket-divider"></div>
            <div className="ticket-grid">
              <div className="ticket-field"><label>Student Name</label><span>{viewTicket.name}</span></div>
              <div className="ticket-field"><label>Roll Number</label><span>{viewTicket.roll_number}</span></div>
              <div className="ticket-field"><label>Branch/Year</label><span>{viewTicket.branch} - {viewTicket.year} ({viewTicket.semester})</span></div>
            </div>
            <div className="ticket-divider"></div>
            <div className="ticket-grid">
              <div className="ticket-field"><label>Hostel</label><span>{viewTicket.hostel_name} (Room {viewTicket.room_number})</span></div>
              <div className="ticket-field"><label>Permitted Date</label><span>{viewTicket.date_of_stay}</span></div>
              <div className="ticket-field"><label>Time</label><span>{viewTicket.time}</span></div>
            </div>
            <div className="ticket-field full"><label>Reason</label><p>{viewTicket.reason}</p></div>
            <div className="ticket-signatures">
              <div className="sig-block"><label>Student Signature</label>{viewTicket.student_signature_url && <img src={viewTicket.student_signature_url} alt="Student Sig" />}</div>
              <div className="sig-block">
                <label>Status Signature</label>
                {viewTicket.status === 'Approved' ? <div className="approved-sig">Digitally Verified</div> : <div className="pending-sig">Awaiting Review</div>}
              </div>
            </div>
            <div className="ticket-footer"><small>System Generated: {new Date(viewTicket.created_at).toLocaleString()}</small></div>
          </div>
          <div className="ticket-actions">
            <button className="print-btn" onClick={() => window.print()}><Icon path={ICONS.print} /> Print / Save as PDF</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-page">
      <div className="leave-card">
        <div className="tabs-header">
          <button className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>
            <Icon path={ICONS.send} /> New Request
          </button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <Icon path={ICONS.history} /> My History
          </button>
        </div>

        {activeTab === 'new' && (
          submitted ? (
            <div className="success-state">
              <div className="success-icon-wrapper"><Icon path={ICONS.check} /></div>
              <h2>Application Submitted!</h2>
              <p>Your request has been logged. You can track the approval status in history.</p>
              <div className="btn-group">
                <button className="submit-btn outline" onClick={() => setActiveTab('history')}>Track Status</button>
                <button className="submit-btn" onClick={resetForm}>New Request</button>
              </div>
            </div>
          ) : (
            <form className="leave-form" onSubmit={handleSubmit}>
              <div className="form-note-top">Apply for hostel stay permissions.</div>
              
              <div className="form-section-title"><Icon path={ICONS.user} className="section-icon" /> Student Details</div>
              <div className="form-grid">
                <div className="form-group full-width">
                   <label>Linked Email</label>
                   <input type="email" value={user?.email || ""} disabled className="disabled-input" />
                </div>
                <div className="form-group"><label>Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
                <div className="form-group"><label>Roll Number *</label><input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required /></div>
                <div className="form-group"><label>Branch *</label><input type="text" name="branch" value={formData.branch} onChange={handleChange} required /></div>
                <div className="form-group">
                  <label>Year *</label>
                  <select name="year" value={formData.year} onChange={handleChange} required>
                    <option value="">Select Year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Semester *</label>
                  <select name="semester" value={formData.semester} onChange={handleChange} required>
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Hostel Name *</label>
                  <select name="hostelName" value={formData.hostelName} onChange={handleChange} required>
                    <option value="">Select Hostel</option>
                    {["Dheeran", "Ponnar", "Sankar", "Valluvar", "Bharathi"].map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Room Number *</label><input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} required /></div>
              </div>

              <div className="form-divider"></div>
              <div className="form-section-title"><Icon path={ICONS.calendar} className="section-icon" /> Leave Information</div>
              <div className="form-grid">
                <div className="form-group"><label>Date of Stay *</label><input type="date" name="date" value={formData.date} onChange={handleChange} required /></div>
                <div className="form-group"><label>Time *</label><input type="time" name="time" value={formData.time} onChange={handleChange} required /></div>
              </div>
              <div className="form-group full-width"><label>Reason *</label><textarea name="reason" value={formData.reason} onChange={handleChange} rows="2" required></textarea></div>

              <div className="form-divider"></div>
              <div className="form-section-title"><Icon path={ICONS.phone} className="section-icon" /> Contact</div>
              <div className="form-grid">
                <div className="form-group"><label>Student Mobile *</label><input type="tel" name="studentMobile" value={formData.studentMobile} onChange={handleChange} required /></div>
                <div className="form-group"><label>Parent Mobile *</label><input type="tel" name="parentMobile" value={formData.parentMobile} onChange={handleChange} required /></div>
              </div>
              <div className="form-group full-width">
                  <label className="checkbox-label">Informed Class Advisor?</label>
                  <div className="radio-group">
                    <label className={`radio-option ${formData.informedAdvisor === 'yes' ? 'selected' : ''}`}><input type="radio" name="informedAdvisor" value="yes" checked={formData.informedAdvisor === "yes"} onChange={handleChange} required /> Yes</label>
                    <label className={`radio-option ${formData.informedAdvisor === 'no' ? 'selected' : ''}`}><input type="radio" name="informedAdvisor" value="no" checked={formData.informedAdvisor === "no"} onChange={handleChange} /> No</label>
                  </div>
              </div>
              {formData.informedAdvisor === "yes" && (
                <div className="form-grid transition-fade">
                  <div className="form-group"><label>Advisor Name</label><input type="text" name="advisorName" value={formData.advisorName} onChange={handleChange} /></div>
                  <div className="form-group"><label>Advisor Mobile</label><input type="tel" name="advisorMobile" value={formData.advisorMobile} onChange={handleChange} /></div>
                </div>
              )}

              <div className="form-divider"></div>
              <div className="form-group full-width">
                <label>Student Signature *</label>
                <label className="file-upload-label">
                  <input type="file" name="studentSignature" onChange={handleChange} accept="image/*" required ref={studentSignatureRef} className="hidden-file-input" />
                  <span className="file-upload-button"><Icon path={ICONS.upload} /> Upload Image</span>
                  <span className="file-name-display">{formData.studentSignature ? formData.studentSignature.name : "No file chosen"}</span>
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>{loading ? "Submitting..." : "Submit Application"}</button>
            </form>
          )
        )}

        {activeTab === 'history' && (
          <div className="history-container">
            {historyLoading ? (
               <div className="loading-spinner">Fetching history...</div>
            ) : historyData.length === 0 ? (
               <div className="empty-history"><p>No records found for {user?.email}.</p></div>
            ) : (
              <div className="history-list">
                {historyData.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="h-left">
                       <div className="h-date">{new Date(item.date_of_stay).toLocaleDateString()}</div>
                       <div className="h-reason">{item.reason}</div>
                    </div>
                    <div className="h-right">
                       <span className={`status-badge ${item.status?.toLowerCase()}`}>{item.status}</span>
                       <button className="view-ticket-btn" onClick={() => setViewTicket(item)}>View</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}