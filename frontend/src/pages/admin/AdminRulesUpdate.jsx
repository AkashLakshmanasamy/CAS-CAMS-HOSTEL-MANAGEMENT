import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/AdminStyles.css"; // Uses the unified Admin theme

// Shared Icon Component
const Icon = ({ path, className = "icon" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  save: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
  clock: "M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z",
  ban: "M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z",
  list: "M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M11 12a1 1 0 100 2h2a1 1 0 100-2h-2z M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2V2a2 2 0 012 2v2h2a1 1 0 100 2h-2v2a2 2 0 100 2h2v2a2 2 0 100 2h-2v2a2 2 0 11-2 0v-1h-2v1a1 1 0 10-2 0v-1H9v1a1 1 0 10-2 0v-1H5a1 1 0 01-1-1v-8A1 1 0 002 9V7a1 1 0 011-1h1V4a2 2 0 012-2z"
};

export default function AdminRulesUpdate() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // State maps to DB columns
  const [rules, setRules] = useState({
    general_rules: [],
    mess_timings: {},
    gate_timings: {},
    prohibited_items: { electrical: [], entertainment: [], restricted: [] },
    consequences: []
  });

  // Fetch data on load
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const { data, error } = await supabase
      .from("hostel_rules")
      .select("*")
      .eq("id", 1)
      .single();

    if (data) {
      setRules(data);
    } else {
      console.error(error);
    }
    setLoading(false);
  };

  // --- Handlers for Form Updates ---

  // 1. General Rules (Textarea: split by new line)
  const handleGeneralChange = (e) => {
    const text = e.target.value;
    setRules({ ...rules, general_rules: text.split("\n") });
  };

  // 2. Timings (Simple Object update)
  const handleTimingChange = (section, key, value) => {
    setRules({
      ...rules,
      [section]: { ...rules[section], [key]: value }
    });
  };

  // 3. Prohibited (Textarea: split by comma or newline)
  const handleProhibitedChange = (category, value) => {
    setRules({
      ...rules,
      prohibited_items: {
        ...rules.prohibited_items,
        [category]: value.split("\n")
      }
    });
  };

  // 4. Consequences (Array of objects)
  const handleConsequenceChange = (index, field, value) => {
    const updated = [...rules.consequences];
    updated[index][field] = value;
    setRules({ ...rules, consequences: updated });
  };

  // Save to DB
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("hostel_rules")
      .update(rules)
      .eq("id", 1);

    if (error) setMessage("❌ Error saving rules");
    else setMessage("✅ Rules updated successfully!");
    setLoading(false);
  };

  if (loading) return <div className="admin-page"><div className="content-card">Loading Editor...</div></div>;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>📝 Edit Rules & Regulations</h2>
          <p className="subtitle">Update timings, fines, and student guidelines.</p>
        </div>
        
        {/* Save Button (Top Right Action) */}
        <button 
            type="submit" 
            form="rules-form" // Links to the form ID
            className="btn-primary" 
            disabled={loading}
          >
            <Icon path={ICONS.save} />
            {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div style={{ 
          marginBottom: "1.5rem", 
          padding: "12px", 
          borderRadius: "8px", 
          textAlign: "center",
          fontWeight: 600,
          color: message.includes("✅") ? "#059669" : "#dc2626",
          backgroundColor: message.includes("✅") ? "#ecfdf5" : "#fef2f2",
        }}>
          {message}
        </div>
      )}

      <form id="rules-form" onSubmit={handleSave}>
        <div className="grid-2" style={{ alignItems: "start" }}>
          
          {/* --- LEFT COLUMN --- */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* 1. General Rules */}
            <div className="content-card">
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#111827' }}>
                <span style={{ marginRight: '8px' }}>📜</span> General Guidelines
              </h3>
              <div className="form-group">
                <label>Enter rules (One per line)</label>
                <textarea
                  className="input-area"
                  rows="12"
                  value={rules.general_rules.join("\n")}
                  onChange={handleGeneralChange}
                />
              </div>
            </div>

            {/* 4. Prohibited Items */}
            <div className="content-card">
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#111827' }}>
                <span style={{ marginRight: '8px' }}>🚫</span> Prohibited Items
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {['electrical', 'entertainment', 'restricted'].map(cat => (
                  <div key={cat} className="form-group">
                    <label style={{ textTransform: "capitalize" }}>{cat} Items</label>
                    <textarea
                      className="input-area"
                      rows="4"
                      placeholder="Separate items by new line"
                      value={rules.prohibited_items[cat]?.join("\n") || ""}
                      onChange={(e) => handleProhibitedChange(cat, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN --- */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* 2. Mess Timings */}
            <div className="content-card">
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#111827' }}>
                <span style={{ marginRight: '8px' }}>🍽️</span> Mess Timings
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                {['breakfast', 'lunch', 'snacks', 'dinner'].map(key => (
                  <div key={key} className="form-group">
                    <label style={{ textTransform: "capitalize" }}>{key}</label>
                    <input
                      type="text"
                      className="input-field"
                      value={rules.mess_timings[key] || ""}
                      onChange={(e) => handleTimingChange('mess_timings', key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className="form-group" style={{ marginTop: "15px" }}>
                <label>Note / Exception</label>
                <input
                  type="text"
                  className="input-field"
                  value={rules.mess_timings.note || ""}
                  onChange={(e) => handleTimingChange('mess_timings', 'note', e.target.value)}
                />
              </div>
            </div>

            {/* 3. Gate Timings */}
            <div className="content-card">
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#111827' }}>
                <span style={{ marginRight: '8px' }}>⏰</span> Gate Timings
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
                {['opening', 'day_scholars', 'curfew_regular', 'curfew_weekend'].map(key => (
                  <div key={key} className="form-group">
                    <label style={{ textTransform: "capitalize" }}>{key.replace('_', ' ')}</label>
                    <input
                      type="text"
                      className="input-field"
                      value={rules.gate_timings[key] || ""}
                      onChange={(e) => handleTimingChange('gate_timings', key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Consequences */}
            <div className="content-card">
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#111827' }}>
                <span style={{ marginRight: '8px' }}>⚠️</span> Consequences
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {rules.consequences.map((item, index) => (
                  <div key={index} style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <div className="form-group" style={{ marginBottom: "8px" }}>
                      <input
                        type="text"
                        className="input-field"
                        style={{ fontWeight: "bold" }}
                        placeholder="Title"
                        value={item.title}
                        onChange={(e) => handleConsequenceChange(index, "title", e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Description"
                        value={item.desc}
                        onChange={(e) => handleConsequenceChange(index, "desc", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
} 