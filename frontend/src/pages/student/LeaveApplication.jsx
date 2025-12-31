import React, { useState, useRef } from "react";
// Adjust this path if your utils folder is in a different location
import { supabase } from "../../utils/supabase"; 
import "../../styles/LeaveApplication.css";

// --- Icons ---
const Icon = ({ path, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`icon ${className}`}
  >
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  user: "M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z",
  calendar: "M5.25 2.25a.75.75 0 00-1.5 0v1.5h-1.5a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25v-10.5a2.25 2.25 0 00-2.25-2.25h-1.5v-1.5a.75.75 0 00-1.5 0v1.5h-6v-1.5z",
  phone: "M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z",
  upload: "M9.97 4.97a.75.75 0 011.06 0l3 3a.75.75 0 01-1.06 1.06l-1.72-1.72v7.94a.75.75 0 01-1.5 0v-7.94L8.97 9.03a.75.75 0 01-1.06-1.06l3-3zM3.75 12.75A.75.75 0 013 12V8.75a.75.75 0 011.5 0V12a.75.75 0 01-.75.75zM12 12.75a.75.75 0 01-.75-.75V8.75a.75.75 0 011.5 0V12a.75.75 0 01-.75.75zM16.25 12.75a.75.75 0 01-.75-.75V8.75a.75.75 0 011.5 0V12a.75.75 0 01-.75.75zM4 17a1 1 0 01-1-1v-2.25a.75.75 0 011.5 0v2.25a.25.25 0 00.25.25h10.5a.25.25 0 00.25-.25v-2.25a.75.75 0 011.5 0V16a1 1 0 01-1 1H4z",
  send: "M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z",
  check: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
};

export default function LeaveApplication() {
  const [formData, setFormData] = useState({
    name: "", rollNumber: "", branch: "", year: "", semester: "",
    hostelName: "", roomNumber: "", date: "", time: "", reason: "",
    studentMobile: "", parentMobile: "", informedAdvisor: "",
    advisorName: "", advisorMobile: "", studentSignature: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const studentSignatureRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload Signature Image
      let signatureUrl = null;
      if (formData.studentSignature) {
        const file = formData.studentSignature;
        // Create a unique file path: signatures/timestamp_filename
        const filePath = `signatures/${Date.now()}_${file.name.replace(/\s/g, '')}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from("leave-signatures")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL for the database
        const { data: publicUrlData } = supabase.storage
          .from("leave-signatures")
          .getPublicUrl(filePath);
          
        signatureUrl = publicUrlData.publicUrl;
      }

      // 2. Insert Data into Database
      const { error } = await supabase.from("leave_applications").insert([{
        name: formData.name,
        roll_number: formData.rollNumber,
        branch: formData.branch,
        year: formData.year,
        semester: formData.semester,
        hostel_name: formData.hostelName,
        room_number: formData.roomNumber,
        date_of_stay: formData.date,
        time: formData.time,
        reason: formData.reason,
        student_mobile: formData.studentMobile,
        parent_mobile: formData.parentMobile,
        informed_advisor: formData.informedAdvisor,
        advisor_name: formData.advisorName || null,
        advisor_mobile: formData.advisorMobile || null,
        student_signature_url: signatureUrl,
        status: "Pending" // Explicitly set status
      }]);

      if (error) throw error;
      setSubmitted(true);
      
    } catch (err) {
      console.error("Submission failed:", err.message);
      alert("Failed to submit application: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", rollNumber: "", branch: "", year: "", semester: "",
      hostelName: "", roomNumber: "", date: "", time: "", reason: "",
      studentMobile: "", parentMobile: "", informedAdvisor: "",
      advisorName: "", advisorMobile: "", studentSignature: null,
    });
    if (studentSignatureRef.current) studentSignatureRef.current.value = "";
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="leave-page">
        <div className="leave-card success-card">
          <div className="success-icon-wrapper">
            <Icon path={ICONS.check} />
          </div>
          <h2>Application Submitted!</h2>
          <p>Your request has been successfully submitted for review.</p>
          <div className="success-note">
            Please note: Approvals usually take 24 hours. Check your status in the dashboard.
          </div>
          <button className="submit-btn" onClick={resetForm}>
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-page">
      <div className="leave-card">
        <div className="leave-header">
          <h2>Permission Form</h2>
          <p>Stay in Hostel During College Hours</p>
        </div>

        <form className="leave-form" onSubmit={handleSubmit}>
          
          {/* Section 1: Student Details */}
          <div className="form-section-title">
            <Icon path={ICONS.user} className="section-icon" /> 
            Student Details
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter full name" />
            </div>
            <div className="form-group">
              <label htmlFor="rollNumber">Roll Number *</label>
              <input type="text" id="rollNumber" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required placeholder="e.g., 21CSR001" />
            </div>
            <div className="form-group">
              <label htmlFor="branch">Branch *</label>
              <input type="text" id="branch" name="branch" value={formData.branch} onChange={handleChange} required placeholder="e.g., CSE" />
            </div>
            <div className="form-group">
              <label htmlFor="year">Year *</label>
              <select id="year" name="year" value={formData.year} onChange={handleChange} required>
                <option value="">Select Year</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="semester">Semester *</label>
              <select id="semester" name="semester" value={formData.semester} onChange={handleChange} required>
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="hostelName">Hostel Name *</label>
              <select id="hostelName" name="hostelName" value={formData.hostelName} onChange={handleChange} required>
                <option value="">Select Hostel</option>
                {["Dheeran", "Ponnar", "Sankar", "Valluvar", "Bharathi"].map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="roomNumber">Room Number *</label>
              <input type="text" id="roomNumber" name="roomNumber" value={formData.roomNumber} onChange={handleChange} required placeholder="e.g., 101" />
            </div>
          </div>

          {/* Section 2: Leave Information */}
          <div className="form-divider"></div>
          <div className="form-section-title">
            <Icon path={ICONS.calendar} className="section-icon" />
            Leave Information
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="date">Date of Stay *</label>
              <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="time">Time *</label>
              <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="reason">Reason for Staying *</label>
            <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} rows="3" placeholder="Provide a valid reason..." required></textarea>
          </div>

          {/* Section 3: Contact Info */}
          <div className="form-divider"></div>
          <div className="form-section-title">
            <Icon path={ICONS.phone} className="section-icon" />
            Contact Information
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="studentMobile">Student Mobile *</label>
              <input type="tel" id="studentMobile" name="studentMobile" value={formData.studentMobile} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="parentMobile">Parent Mobile *</label>
              <input type="tel" id="parentMobile" name="parentMobile" value={formData.parentMobile} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="checkbox-label">Informed to Class Advisor?</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.informedAdvisor === 'yes' ? 'selected' : ''}`}>
                <input type="radio" name="informedAdvisor" value="yes" checked={formData.informedAdvisor === "yes"} onChange={handleChange} required />
                Yes
              </label>
              <label className={`radio-option ${formData.informedAdvisor === 'no' ? 'selected' : ''}`}>
                <input type="radio" name="informedAdvisor" value="no" checked={formData.informedAdvisor === "no"} onChange={handleChange} />
                No
              </label>
            </div>
          </div>

          {formData.informedAdvisor === "yes" && (
            <div className="form-grid transition-fade">
              <div className="form-group">
                <label htmlFor="advisorName">Class Advisor Name</label>
                <input type="text" id="advisorName" name="advisorName" value={formData.advisorName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="advisorMobile">Advisor Mobile</label>
                <input type="tel" id="advisorMobile" name="advisorMobile" value={formData.advisorMobile} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* Section 4: Signature */}
          <div className="form-divider"></div>
          <div className="form-group full-width">
            <label htmlFor="studentSignature">Student Signature *</label>
            <label htmlFor="studentSignature" className="file-upload-label">
              <input type="file" id="studentSignature" name="studentSignature" onChange={handleChange} accept="image/*" required ref={studentSignatureRef} className="hidden-file-input" />
              <span className="file-upload-button">
                <Icon path={ICONS.upload} />
                Upload Signature Image
              </span>
              <span className="file-name-display">{formData.studentSignature ? formData.studentSignature.name : "No file chosen"}</span>
            </label>
          </div>

          <div className="form-note">
            <p><strong>Note:</strong> Ensure this form is submitted at least 2 hours before class starts.</p>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Submitting...
              </>
            ) : (
              <>
                Submit Application
                <Icon path={ICONS.send} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}