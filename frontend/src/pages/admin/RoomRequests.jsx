import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/RoomRequests.css";

// Simple Icon Component for consistency
const Icon = ({ path, className = "icon" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  refresh: "M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z",
  document: "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z",
  check: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
  close: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
};

export default function RoomRequests({ onActionComplete }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);

    let query = supabase
      .from("allocations")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (!error) setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const updateStatus = async (id, status, regNo) => {
    try {
      if (!window.confirm(`Are you sure you want to mark this as ${status}?`)) return;

      const { error: updateError } = await supabase
        .from("allocations")
        .update({ status })
        .eq("id", id);

      if (updateError) throw updateError;

      const canApplyValue = status === "confirmed" ? false : true;
      
      const { error: studentError } = await supabase
        .from("student_profiles")
        .update({ can_apply: canApplyValue })
        .eq("roll_no", regNo);

      if (studentError) console.error("Error updating student profile:", studentError);

      fetchRequests();
      if (onActionComplete) onActionComplete();

    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="admin-page">
      {/* --- Header --- */}
      <div className="page-header">
        <div>
          <h2>Room Allocation Requests</h2>
          <p className="subtitle">Manage hostel room assignments and verify receipts.</p>
        </div>
        <button onClick={fetchRequests} className="btn-secondary">
          <Icon path={ICONS.refresh} /> Refresh
        </button>
      </div>

      {/* --- Filter Bar --- */}
      <div className="filter-bar">
        {['all', 'pending', 'confirmed', 'rejected'].map(f => (
          <button 
            key={f}
            className={`btn-secondary ${filter === f ? 'active-filter' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* --- Table --- */}
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Hostel</th>
              <th>Room Info</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center p-4">Loading requests...</td></tr>
            ) : requests.length === 0 ? (
               <tr><td colSpan="6" className="text-center p-4">No requests found.</td></tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="cell-title">{r.name}</div>
                    <div className="cell-subtitle">{r.reg_no}</div>
                  </td>
                  <td>{r.hostel}</td>
                  <td>
                    <div className="room-info-pill">
                      <span className="pill-label">Room</span> {r.room_number} &bull; <span className="pill-label">Bed</span> {r.bed_number}
                    </div>
                  </td>
                  
                  {/* Document Column */}
                  <td>
                    {r.receipt_url ? (
                      <a
                        href={r.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-link"
                      >
                        <Icon path={ICONS.document} className="icon-sm" /> View Receipt
                      </a>
                    ) : (
                      <span className="text-muted text-sm">No File</span>
                    )}
                  </td>

                  <td>
                    <span className={`status-badge ${r.status}`}>
                      {r.status}
                    </span>
                  </td>

                  <td>
                    {r.status === "pending" ? (
                      <div className="action-row">
                        <button
                          className="action-btn resolve"
                          onClick={() => updateStatus(r.id, "confirmed", r.reg_no)}
                          title="Confirm Allocation"
                        >
                          <Icon path={ICONS.check} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => updateStatus(r.id, "rejected", r.reg_no)}
                          title="Reject Allocation"
                        >
                          <Icon path={ICONS.close} />
                        </button>
                      </div>
                    ) : (
                       <span className="text-muted text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}