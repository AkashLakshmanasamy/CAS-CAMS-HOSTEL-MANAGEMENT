import React from "react";
const FLOORS = ["Ground","First","Second","Third"];

export default function FloorSelector({ value, onChange }) {
  return (
    <select value={value} onChange={(e)=>onChange(e.target.value)}>
      {FLOORS.map(f => <option key={f} value={f}>{f}</option>)}
    </select>
  );
}
