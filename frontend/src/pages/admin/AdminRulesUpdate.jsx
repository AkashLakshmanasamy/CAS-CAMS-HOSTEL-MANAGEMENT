import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/Rules.css";

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

  if (loading) return <div className="rules-page">Loading Editor...</div>;

  return (
    <div className="rules-page">
      <div className="rules-card">
        <div className="rules-header" style={{ background: "#1a202c" }}>
          <h2>📝 Edit Rules & Regulations</h2>
          <p>Update timings, fines, and guidelines.</p>
        </div>

        <form onSubmit={handleSave} className="rules-body">
          {message && <div style={{ textAlign: "center", marginBottom: "20px", color: "green", fontWeight: "bold" }}>{message}</div>}

          {/* 1. General Rules */}
          <div className="rules-section">
            <div className="section-title">General Guidelines (One per line)</div>
            <textarea
              className="input-area"
              rows="8"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
              value={rules.general_rules.join("\n")}
              onChange={handleGeneralChange}
            />
          </div>

          {/* 2. Mess Timings */}
          <div className="rules-section">
            <div className="section-title">Mess Timings</div>
            <div className="grid-2-col">
              {['breakfast', 'lunch', 'snacks', 'dinner'].map(key => (
                <div key={key}>
                  <label style={{ textTransform: "capitalize", fontWeight: "bold" }}>{key}</label>
                  <input
                    type="text"
                    value={rules.mess_timings[key] || ""}
                    onChange={(e) => handleTimingChange('mess_timings', key, e.target.value)}
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>
              ))}
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontWeight: "bold" }}>Note</label>
                <input
                  type="text"
                  value={rules.mess_timings.note || ""}
                  onChange={(e) => handleTimingChange('mess_timings', 'note', e.target.value)}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </div>
            </div>
          </div>

          {/* 3. Gate Timings */}
          <div className="rules-section">
            <div className="section-title">Gate Timings</div>
            <div className="grid-2-col">
              {['opening', 'day_scholars', 'curfew_regular', 'curfew_weekend'].map(key => (
                <div key={key}>
                  <label style={{ textTransform: "capitalize", fontWeight: "bold" }}>{key.replace('_', ' ')}</label>
                  <input
                    type="text"
                    value={rules.gate_timings[key] || ""}
                    onChange={(e) => handleTimingChange('gate_timings', key, e.target.value)}
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 4. Prohibited Items */}
          <div className="rules-section">
            <div className="section-title">Prohibited Items (One per line)</div>
            <div className="grid-2-col">
              {['electrical', 'entertainment', 'restricted'].map(cat => (
                <div key={cat}>
                  <label style={{ textTransform: "capitalize", fontWeight: "bold" }}>{cat}</label>
                  <textarea
                    rows="5"
                    value={rules.prohibited_items[cat]?.join("\n") || ""}
                    onChange={(e) => handleProhibitedChange(cat, e.target.value)}
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 5. Consequences */}
          <div className="rules-section">
            <div className="section-title">Consequences</div>
            {rules.consequences.map((item, index) => (
              <div key={index} style={{ marginBottom: "15px", padding: "10px", border: "1px solid #eee", borderRadius: "5px" }}>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleConsequenceChange(index, "title", e.target.value)}
                  style={{ fontWeight: "bold", width: "100%", marginBottom: "5px", padding: "5px" }}
                />
                <input
                  type="text"
                  value={item.desc}
                  onChange={(e) => handleConsequenceChange(index, "desc", e.target.value)}
                  style={{ width: "100%", padding: "5px" }}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            style={{
              width: "100%", padding: "15px", background: "#2c5282", color: "white",
              fontSize: "1.2rem", fontWeight: "bold", border: "none", borderRadius: "8px", cursor: "pointer"
            }}
          >
            Save All Changes
          </button>

        </form>
      </div>
    </div>
  );
}