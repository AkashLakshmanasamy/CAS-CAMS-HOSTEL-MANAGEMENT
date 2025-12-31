import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/Rules.css";

// --- Icons (Kept exactly same as before) ---
const Icon = ({ path, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`icon ${className}`}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  book: "M10 1a9 9 0 100 18 9 9 0 000-18zm.75 14.25a.75.75 0 01-1.5 0v-6.5a.75.75 0 011.5 0v6.5zm0-8.5a.75.75 0 01-1.5 0v-.5a.75.75 0 011.5 0v.5z",
  clock: "M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z",
  ban: "M10 2a8 8 0 100 16 8 8 0 000-16zM5.94 5.94a.75.75 0 011.06-1.06l7.06 7.06a.75.75 0 01-1.06 1.06L5.94 5.94zm-1.06 7.06a.75.75 0 011.06-1.06l7.06 7.06a.75.75 0 01-1.06 1.06l-7.06-7.06z",
  warning: "M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z",
  list: "M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
};

export default function Rules() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      const { data: rulesData, error } = await supabase
        .from("hostel_rules")
        .select("*")
        .eq("id", 1) // Fetch the single settings row
        .single();
      
      if (rulesData) setData(rulesData);
      setLoading(false);
    };
    fetchRules();
  }, []);

  if (loading) return <div className="rules-page">Loading Rules...</div>;
  if (!data) return <div className="rules-page">No rules found.</div>;

  return (
    <div className="rules-page">
      <div className="rules-card">
        <div className="rules-header">
          <h2>Hostel Rules & Regulations</h2>
          <p>Guidelines to ensure a safe, disciplined, and harmonious living environment.</p>
        </div>

        <div className="rules-body">
          
          {/* Section 1: General Rules */}
          <div className="rules-section">
            <div className="section-title">
              <Icon path={ICONS.list} className="section-icon" />
              General Guidelines
            </div>
            <div className="rules-list">
              {data.general_rules && data.general_rules.map((rule, index) => (
                <div key={index} className="rule-item">
                  <div className="rule-number">{index + 1}</div>
                  <div className="rule-text">{rule}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Timings (Grid Layout) */}
          <div className="grid-2-col">
            <div className="rules-section">
              <div className="section-title">
                <Icon path={ICONS.clock} className="section-icon" />
                Mess Timings
              </div>
              <div className="timing-table">
                {['breakfast', 'lunch', 'snacks', 'dinner'].map(key => (
                  <div className="timing-row" key={key}>
                    <span style={{textTransform: 'capitalize'}}>{key}</span>
                    <span className="time-badge">{data.mess_timings[key]}</span>
                  </div>
                ))}
              </div>
              {data.mess_timings.note && (
                <div className="note-box">
                  <strong>Note:</strong> {data.mess_timings.note}
                </div>
              )}
            </div>

            <div className="rules-section">
              <div className="section-title">
                <Icon path={ICONS.clock} className="section-icon" />
                Gate Timings
              </div>
              <div className="timing-table">
                <div className="timing-row">
                  <span>Gate Opens</span>
                  <span className="time-badge">{data.gate_timings.opening}</span>
                </div>
                <div className="timing-row">
                  <span>Day Scholars</span>
                  <span className="time-badge">{data.gate_timings.day_scholars}</span>
                </div>
                <div className="timing-row">
                  <span>Regular Curfew</span>
                  <span className="time-badge">{data.gate_timings.curfew_regular}</span>
                </div>
                <div className="timing-row">
                  <span>Weekend Curfew</span>
                  <span className="time-badge">{data.gate_timings.curfew_weekend}</span>
                </div>
              </div>
              {data.gate_timings.note && (
                <div className="note-box">
                  <strong>Note:</strong> {data.gate_timings.note}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Prohibited Items */}
          <div className="rules-section">
            <div className="section-title">
              <Icon path={ICONS.ban} className="section-icon" />
              Prohibited Items
            </div>
            <div className="prohibited-grid">
              <div className="prohibited-card">
                <h4>Electrical Appliances</h4>
                <ul>
                  {data.prohibited_items.electrical?.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="prohibited-card">
                <h4>Entertainment</h4>
                <ul>
                  {data.prohibited_items.entertainment?.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="prohibited-card">
                <h4>Restricted Items</h4>
                <ul>
                  {data.prohibited_items.restricted?.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Consequences */}
          <div className="rules-section no-border">
            <div className="section-title">
              <Icon path={ICONS.warning} className="section-icon" />
              Consequences of Violations
            </div>
            <div className="consequences-grid">
              {data.consequences && data.consequences.map((item, index) => (
                <div key={index} className={`consequence-item ${item.level}`}>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}