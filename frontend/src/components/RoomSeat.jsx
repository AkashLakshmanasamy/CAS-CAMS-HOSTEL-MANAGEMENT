// RoomSeat.jsx
import React from "react";
import "../styles/RoomSeat.css";

export default function RoomSeat({ roomNumber, beds, onSelectFreeBed, selected }) {
  const filled = beds.filter(Boolean).length;
  const status = filled === 0 ? "empty" : filled === 3 ? "full" : "partial";

  return (
    <div className={`room-seat ${status}`}>
      <div className="room-number">Room {roomNumber}</div>
      <div className="beds">
        {beds.map((isOcc, i) => {
          const isSel = selected?.roomNo === roomNumber && selected?.bedIndex === i;
          return (
            <div
              key={i}
              className={`bed ${isOcc ? "filled" : ""} ${isSel ? "selected" : ""}`}
              title={isOcc ? "Occupied" : "Available"}
              onClick={() => !isOcc && onSelectFreeBed(roomNumber, i)}
            />
          );
        })}
      </div>
    </div>
  );
}