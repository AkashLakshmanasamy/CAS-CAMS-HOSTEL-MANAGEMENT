import React from "react";
const HOSTELS = ["Hostel 1", "Hostel 2", "Hostel 3", "Hostel 4", "Hostel 5", "Hostel 6", "Hostel 7"];

export default function HostelSelector({ value, onChange }) {
  return (
    <select value={value} onChange={(e)=>onChange(e.target.value)}>
      {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
    </select>
  );
}
