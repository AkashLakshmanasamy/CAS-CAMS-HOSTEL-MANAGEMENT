import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/Rules.css"; // Reuse your existing nice CSS

export default function AdminAnnouncements() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);

  // Fetch existing announcements
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setList(data);
  };

  // Add new announcement
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("announcements").insert([form]);

    if (!error) {
      setForm({ title: "", content: "" });
      fetchAnnouncements(); // Refresh list
    } else {
      alert("Error posting announcement");
    }
    setLoading(false);
  };

  // Delete announcement
  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this?");
    if (!confirm) return;

    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (!error) fetchAnnouncements();
  };

  return (
    <div className="rules-page">
      <div className="rules-card">
        <div className="rules-header">
          <h2>📢 Manage Announcements</h2>
          <p>Post updates for the Student Dashboard.</p>
        </div>

        <div className="rules-body">
          {/* Form Section */}
          <div className="rules-section">
            <div className="section-title">Post New Announcement</div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input
                type="text"
                placeholder="Title (e.g., Holiday Notice)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
              <textarea
                rows="3"
                placeholder="Details..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px", background: "#2c5282", color: "white",
                  border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold"
                }}
              >
                {loading ? "Posting..." : "Post Announcement"}
              </button>
            </form>
          </div>

          {/* List Section */}
          <div className="rules-section">
            <div className="section-title">History</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {list.map((item) => (
                <div key={item.id} style={{
                  padding: "15px", border: "1px solid #e2e8f0", borderRadius: "8px",
                  display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc"
                }}>
                  <div>
                    <h4 style={{ margin: "0 0 5px 0", color: "#2d3748" }}>{item.title}</h4>
                    <p style={{ margin: 0, color: "#718096", fontSize: "0.9rem" }}>{item.content}</p>
                    <small style={{ color: "#a0aec0" }}>{new Date(item.created_at).toLocaleDateString()}</small>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      padding: "5px 10px", background: "#feb2b2", color: "#c53030",
                      border: "none", borderRadius: "5px", cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {list.length === 0 && <p>No announcements yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}