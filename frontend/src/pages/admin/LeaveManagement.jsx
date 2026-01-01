import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/LeaveManagement.css";

// --- ICONS ---
const Icon = ({ path, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`icon ${className}`}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  refresh: "M.75 4.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5H1.5a.75.75 0 01-.75-.75zM1.5 6.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H1.5zM19.25 15.25a.75.75 0 01-.75.75h-7.5a.75.75 0 010-1.5h7.5a.75.75 0 01.75.75zM18.5 13.25a.75.75 0 000-1.5h-4.5a.75.75 0 000 1.5h4.5z",
  approve: "M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z",
  reject: "M10 18a8 8 0 100-16 8 8 0 000 16zM6.5 9.25a.75.75 0 000 1.5h7a.75.75 0 000-1.5h-7z",
  upload: "M9.97 4.97a.75.75 0 011.06 0l3 3a.75.75 0 01-1.06 1.06l-1.72-1.72v7.94a.75.75 0 01-1.5 0v-7.94L8.97 9.03a.75.75 0 01-1.06-1.06l3-3zM3.75 12.75A.75.75 0 013 12V8.75a.75.75 0 011.5 0V12a.75.75 0 01-.75.75z",
  close: "M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z",
  user: "M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z",
  calendar: "M5.25 2.25a.75.75 0 00-1.5 0v1.5h-1.5a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25v-10.5a2.25 2.25 0 00-2.25-2.25h-1.5v-1.5a.75.75 0 00-1.5 0v1.5h-6v-1.5z",
  phone: "M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z",
  home: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z",
};

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE FOR ADMIN SIGNATURE ---
  const [adminSignature, setAdminSignature] = useState(null);
  const [signatureUploading, setSignatureUploading] = useState(false);
  
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 1. Check if signature is already saved in local storage to avoid re-uploading every time
    const saved = localStorage.getItem("adminSignatureUrl");
    if (saved) setAdminSignature(saved);
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leave_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeaves(data || []);
      setMessage("");
    } catch (error) {
      console.error("Fetch error:", error.message);
      setMessage(`Failed to fetch leaves: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- SIGNATURE UPLOAD FUNCTION ---
  const handleSignatureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSignatureUploading(true);
    setMessage("Uploading signature...");
    
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `admin_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("leave-signatures")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the Public URL
      const { data: publicUrlData } = supabase.storage
        .from("leave-signatures")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // 3. Save to State & LocalStorage
      setAdminSignature(publicUrl);
      localStorage.setItem("adminSignatureUrl", publicUrl);
      setMessage("✅ Signature uploaded successfully!");
    } catch (error) {
      setMessage(`Failed to upload signature: ${error.message}`);
    } finally {
      setSignatureUploading(false);
    }
  };

  // --- APPROVE/REJECT LOGIC ---
  const updateLeave = async (id, status) => {
    // Validation: Require signature for approval
    if (status === "approved" && !adminSignature) {
      setMessage("⚠️ Please upload your signature before approving.");
      return;
    }

    try {
      // 1. Update the MAIN Leave Table (This is what the student sees)
      const { error } = await supabase
        .from("leave_applications")
        .update({
          // CRITICAL FIX: Ensure status is lowercase to match DB check constraint
          status: status === "approved" ? "approved" : "rejected",
          // Removed 'updated_at' here because column does not exist in DB
          admin_signature_url: status === "approved" ? adminSignature : null,
        })
        .eq("id", id);

      if (error) throw error;

      // 2. (Optional) Generate a specific "Verified Form" entry
      // This creates a separate record for the student to "download"
      if (status === "approved") {
        await generateVerifiedForm(id, adminSignature);
      }

      await fetchLeaves();
      if (showModal) setShowModal(false);
      setMessage(`Leave application ${status} successfully!`);
    } catch (error) {
      console.error(error);
      setMessage(`Action failed: ${error.message}`);
    }
  };

  const generateVerifiedForm = async (leaveId, signatureUrl) => {
    const leave = leaves.find((l) => l.id === leaveId);
    if (!leave) return;

    const formContent = `
      PERMISSION FORM - VERIFIED
      Student: ${leave.name} (${leave.roll_number})
      Branch: ${leave.branch}, Year: ${leave.year}, Sem: ${leave.semester}
      
      Hostel: ${leave.hostel_name}, Room: ${leave.room_number}
      Date: ${leave.date_of_stay}, Time: ${leave.time}
      Reason: ${leave.reason}
      
      Contacts: Student (${leave.student_mobile}), Parent (${leave.parent_mobile})
      Advisor: ${leave.advisor_name || 'N/A'} (${leave.advisor_mobile || 'N/A'})
      
      Status: APPROVED ✅
    `;

    // Ensure 'verified_forms' table exists in Supabase for this to work
    await supabase.from("verified_forms").insert([{
      leave_id: leaveId,
      user_id: leave.user_id, // This links it to the student dashboard
      content: formContent,
      signature_url: signatureUrl,
    }]);
  };

  const viewLeaveDetails = (leave) => {
    setSelectedLeave(leave);
    setShowModal(true);
  };
    
  const filteredLeaves = filter === "all" 
    ? leaves 
    : leaves.filter(leave => leave.status?.toLowerCase() === filter.toLowerCase());

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === "Pending" || l.status === "pending").length,
    approved: leaves.filter(l => l.status === "Approved" || l.status === "approved").length,
    rejected: leaves.filter(l => l.status === "Rejected" || l.status === "rejected").length
  };

  return (
    <div className="leave-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2>Permission Requests</h2>
          <p>Manage hostel stay permissions</p>
        </div>
        <button onClick={fetchLeaves} className="refresh-btn">
          <Icon path={ICONS.refresh} /> Refresh
        </button>
      </div>

      {message && (
        <div className={`status-message ${message.includes("✅") || message.includes("success") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* --- ADMIN SIGNATURE UPLOAD SECTION --- */}
      <div className="signature-section">
        <div className="section-title">
          <Icon path={ICONS.upload} className="icon-sm" /> Admin Signature Setup
        </div>
        <div className="signature-controls">
           <label className="file-upload-btn">
             Choose Image
             <input
               type="file"
               id="adminSig"
               accept="image/*"
               onChange={handleSignatureUpload}
               disabled={signatureUploading}
               hidden
             />
           </label>
           
           {signatureUploading && <span className="sig-status">Uploading...</span>}
           
           {adminSignature ? (
             <div className="sig-preview-container">
               <span className="sig-status success">✅ Signature Loaded</span>
               <img src={adminSignature} alt="Admin Signature" className="sig-preview-img" />
             </div>
           ) : (
             <span className="sig-status error">⚠️ No signature uploaded yet</span>
           )}
        </div>
        <p className="sig-help-text">Upload your digital signature once. It will be applied to all Approved forms.</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button 
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="requests-list">
        {loading ? (
          <div className="loading-state">Loading requests...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="empty-state">No {filter !== 'all' ? filter : ''} requests found.</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <div className="cell-primary">{leave.name}</div>
                      <div className="cell-secondary">{leave.roll_number} | {leave.branch}</div>
                    </td>
                    <td>
                      <div className="cell-primary">{leave.date_of_stay}</div>
                      <div className="cell-secondary">{leave.time}</div>
                    </td>
                    <td>
                      <div className="reason-truncate">{leave.reason}</div>
                    </td>
                    <td>
                      <span className={`status-pill ${leave.status?.toLowerCase()}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      <button className="view-btn" onClick={() => viewLeaveDetails(leave)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && selectedLeave && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-close-wrapper">
              <button onClick={() => setShowModal(false)} className="close-btn">
                <Icon path={ICONS.close} />
              </button>
            </div>

            <div className="leave-card modal-card">
              <div className="leave-header">
                <h2>Application Details</h2>
                <p>Submitted on: {new Date(selectedLeave.created_at).toLocaleDateString()}</p>
              </div>

              <div className="leave-form read-only">
                {/* ... (Student Details) ... */}
                <div className="form-section-title">
                  <Icon path={ICONS.user} className="section-icon" /> Student Details
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name</label>
                    <div className="read-only-field">{selectedLeave.name}</div>
                  </div>
                  <div className="form-group">
                    <label>Roll Number</label>
                    <div className="read-only-field">{selectedLeave.roll_number}</div>
                  </div>
                  {/* ... Add other fields as needed ... */}
                </div>

                {/* ... (Hostel & Stay Details) ... */}
                <div className="form-section-title">
                  <Icon path={ICONS.home} className="section-icon" /> Hostel & Stay
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Hostel</label>
                    <div className="read-only-field">{selectedLeave.hostel_name} ({selectedLeave.room_number})</div>
                  </div>
                  <div className="form-group">
                    <label>Stay Date</label>
                    <div className="read-only-field">{selectedLeave.date_of_stay} at {selectedLeave.time}</div>
                  </div>
                  <div className="form-group full-width">
                    <label>Reason</label>
                    <div className="read-only-field">{selectedLeave.reason}</div>
                  </div>
                </div>

                {/* Student Signature */}
                <div className="form-group full-width" style={{marginTop: '1rem'}}>
                  <label>Student Signature</label>
                  {selectedLeave.student_signature_url ? (
                    <img src={selectedLeave.student_signature_url} alt="Student Signature" className="signature-display" />
                  ) : (
                    <div className="read-only-field">No signature uploaded</div>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="modal-actions">
                  {selectedLeave.status?.toLowerCase() === 'pending' ? (
                    <>
                      <button 
                        className="action-btn approve"
                        onClick={() => updateLeave(selectedLeave.id, "approved")}
                        // DISABLED if no admin signature is present
                        disabled={!adminSignature}
                        title={!adminSignature ? "Upload signature first" : "Approve Leave"}
                      >
                        <Icon path={ICONS.approve} /> Approve
                      </button>
                      <button 
                        className="action-btn reject"
                        onClick={() => updateLeave(selectedLeave.id, "rejected")}
                      >
                        <Icon path={ICONS.reject} /> Reject
                      </button>
                    </>
                  ) : (
                    <div className={`status-banner ${selectedLeave.status?.toLowerCase()}`}>
                      Application is {selectedLeave.status}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}