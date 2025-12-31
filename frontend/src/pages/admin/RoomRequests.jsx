import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/RoomRequests.css";

export default function RoomRequests() {
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

  const updateStatus = async (id, status) => {
    await supabase.from("allocations").update({ status }).eq("id", id);
    fetchRequests();
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

                  <td className="action-buttons">
                    {r.status === "pending" && (
                      <>
                        <button
                          className="btn confirm"
                          onClick={() =>
                            updateStatus(r.id, "confirmed")
                          }
                        >
                          Confirm
                        </button>
                        <button
                          className="btn reject"
                          onClick={() =>
                            updateStatus(r.id, "rejected")
                          }
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
                  <td colSpan="7" className="empty-state">
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
