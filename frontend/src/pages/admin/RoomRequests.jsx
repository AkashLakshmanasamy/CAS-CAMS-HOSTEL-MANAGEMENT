import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/RoomRequests.css";

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

      // 1. Update allocation status
      const { error: updateError } = await supabase
        .from("allocations")
        .update({ status })
        .eq("id", id);

      if (updateError) throw updateError;

      // 2. Update student profile can_apply status
      const canApplyValue = status === "confirmed" ? false : true;
      
      const { error: studentError } = await supabase
        .from("student_profiles")
        .update({ can_apply: canApplyValue })
        .eq("roll_no", regNo);

      if (studentError) console.error("Error updating student profile:", studentError);

      alert(`Status updated to "${status}"`);
      
      fetchRequests();
      if (onActionComplete) onActionComplete();

    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="room-requests">
      <div className="room-requests-header">
        <h2>Room Allocation Requests</h2>

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Loading requests...</p>
      ) : (
        <div className="table-wrapper">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Registration No</th>
                <th>Hostel</th>
                <th>Room</th>
                <th>Bed</th>
                <th>Status</th>
                <th>Document</th> 
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.reg_no}</td>
                  <td>{r.hostel}</td>
                  <td>
                    <span className="room-pill">{r.room_number}</span>
                  </td>
                  <td>
                    <span className="bed-pill">{r.bed_number}</span>
                  </td>

                  <td>
                    <span className={`status-badge ${r.status}`}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  
                  {/* Document Column */}
                  <td>
                    {r.receipt_url ? (
                      <a
                        href={r.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="link-document"
                        style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '0.9rem' }}
                      >
                        View Receipt
                      </a>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No File</span>
                    )}
                  </td>

                  <td className="action-buttons">
                    {r.status === "pending" && (
                      <>
                        <button
                          className="btn confirm"
                          onClick={() => updateStatus(r.id, "confirmed", r.reg_no)}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn reject"
                          onClick={() => updateStatus(r.id, "rejected", r.reg_no)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {requests.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-state"> 
                    No requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}