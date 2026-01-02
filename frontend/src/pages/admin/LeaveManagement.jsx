import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/LeaveManagement.css"; // Using the unified Admin Theme

// --- ICONS (Heroicons Style) ---
const Icon = ({ path, className = "icon" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  refresh: "M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z",
  check: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
  x: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
  upload: "M3 17a1 1 0 011-1h12a1 1 0 011 1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z",
  pen: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z",
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

  const handleSignatureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSignatureUploading(true);
    setMessage("Uploading signature...");
    
    const fileExt = file.name.split('.').pop();
    const fileName = `admin_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("leave-signatures")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("leave-signatures")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      setAdminSignature(publicUrl);
      localStorage.setItem("adminSignatureUrl", publicUrl);
      setMessage("✅ Signature uploaded successfully!");
    } catch (error) {
      setMessage(`Failed to upload signature: ${error.message}`);
    } finally {
      setSignatureUploading(false);
    }
  };

  const updateLeave = async (id, status) => {
    if (status === "approved" && !adminSignature) {
      setMessage("⚠️ Please upload your signature before approving.");
      return;
    }

    try {
      const { error } = await supabase
        .from("leave_applications")
        .update({
          status: status === "approved" ? "approved" : "rejected",
          admin_signature_url: status === "approved" ? adminSignature : null,
        })
        .eq("id", id);

      if (error) throw error;

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

    await supabase.from("verified_forms").insert([{
      leave_id: leaveId,
      user_id: leave.user_id,
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
    pending: leaves.filter(l => l.status?.toLowerCase() === "pending").length,
    approved: leaves.filter(l => l.status?.toLowerCase() === "approved").length,
    rejected: leaves.filter(l => l.status?.toLowerCase() === "rejected").length
  };

  return (
    <div className="admin-page">
      {/* --- Header --- */}
      <div className="page-header">
        <div>
          <h2>✈️ Permission Requests</h2>
          <p className="subtitle">Manage hostel stay and outing permissions.</p>
        </div>
        <button onClick={fetchLeaves} className="btn-secondary">
          <Icon path={ICONS.refresh} /> Refresh
        </button>
      </div>

      {message && (
        <div className={`status-banner-msg ${message.includes("✅") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      {/* --- Stats & Signature Grid --- */}
      <div className="dashboard-grid">
        
        {/* Stats Cards */}
        <div className="stats-group">
          <div className="stat-card pending">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-value">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>

        {/* Signature Config Card */}
        <div className="content-card signature-card">
          <div className="card-header-small">
            <Icon path={ICONS.pen} /> Admin Signature
          </div>
          <div className="sig-upload-row">
            {adminSignature ? (
              <div className="sig-preview-box">
                <img src={adminSignature} alt="Sig" />
              </div>
            ) : (
              <div className="sig-preview-box empty">No Sig</div>
            )}
            <label className="btn-primary upload-btn">
              <input type="file" accept="image/*" onChange={handleSignatureUpload} hidden disabled={signatureUploading} />
              <Icon path={ICONS.upload} /> {signatureUploading ? "Uploading..." : "Update Signature"}
            </label>
          </div>
          <p className="helper-text">Required for approvals.</p>
        </div>
      </div>

      {/* --- Filters --- */}
      <div className="filter-bar">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button 
            key={f}
            className={`filter-pill ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* --- Data Table --- */}
      <div className="content-card table-card">
        {loading ? (
          <div className="loading-state">Loading requests...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="empty-state">No {filter !== 'all' ? filter : ''} requests found.</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Date Requested</th>
                  <th style={{width: '30%'}}>Reason</th>
                  <th>Status</th>
                  <th align="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <div className="cell-title">{leave.name}</div>
                      <div className="cell-subtitle">{leave.roll_number} • {leave.branch}</div>
                    </td>
                    <td>
                      <div className="cell-text">{leave.date_of_stay}</div>
                      <div className="cell-subtitle">{leave.time}</div>
                    </td>
                    <td>
                      <div className="cell-truncate" title={leave.reason}>{leave.reason}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${leave.status?.toLowerCase()}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td align="right">
                      <button className="btn-secondary btn-sm" onClick={() => viewLeaveDetails(leave)}>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {showModal && selectedLeave && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Request Details</h3>
                <span className="modal-subtitle">Submitted: {new Date(selectedLeave.created_at).toLocaleDateString()}</span>
              </div>
              <button onClick={() => setShowModal(false)} className="close-btn">
                <Icon path={ICONS.x} />
              </button>
            </div>

            <div className="modal-body-grid">
              {/* Student Section */}
              <div className="detail-section full-width">
                <h4>Student Information</h4>
                <div className="grid-2">
                  <div><label>Name</label><p>{selectedLeave.name}</p></div>
                  <div><label>Roll No</label><p>{selectedLeave.roll_number}</p></div>
                  <div><label>Mobile</label><p>{selectedLeave.student_mobile}</p></div>
                  <div><label>Parent Mobile</label><p>{selectedLeave.parent_mobile}</p></div>
                </div>
              </div>

              {/* Stay Section */}
              <div className="detail-section full-width">
                <h4>Stay Details</h4>
                <div className="grid-2">
                  <div><label>Hostel</label><p>{selectedLeave.hostel_name} ({selectedLeave.room_number})</p></div>
                  <div><label>Date & Time</label><p>{selectedLeave.date_of_stay} at {selectedLeave.time}</p></div>
                  <div className="full-col"><label>Reason</label><p className="reason-box">{selectedLeave.reason}</p></div>
                </div>
              </div>

               {/* Signature Section */}
               <div className="detail-section full-width">
                <label>Student Signature</label>
                {selectedLeave.student_signature_url ? (
                  <img src={selectedLeave.student_signature_url} className="sig-img" alt="Student Sig" />
                ) : (
                  <p className="text-muted">No signature provided.</p>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="modal-footer">
              {selectedLeave.status?.toLowerCase() === 'pending' ? (
                <>
                  <button 
                    onClick={() => updateLeave(selectedLeave.id, "rejected")}
                    className="btn-danger"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => updateLeave(selectedLeave.id, "approved")}
                    className="btn-primary"
                    disabled={!adminSignature}
                  >
                    {adminSignature ? "Approve & Sign" : "Upload Signature First"}
                  </button>
                </>
              ) : (
                <div className={`status-text ${selectedLeave.status?.toLowerCase()}`}>
                  Request is {selectedLeave.status}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}