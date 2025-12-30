import React from "react";
const HOSTELS = ["Dheeran","Valluvar","Ponnar","Sankar","Elango","Kamban","Bharathi"];

export default function HostelSelector({ value, onChange }) {
  return (
    <select value={value} onChange={(e)=>onChange(e.target.value)}>
      {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
    </select>
  );
}
