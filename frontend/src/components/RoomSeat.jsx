import React from "react";
import "../styles/RoomSeat.css";

export default function RoomSeat({ roomNumber, beds, onSelectFreeBed, selected }) {
  const filled = beds.filter(Boolean).length;
  const status = filled === 0 ? "empty" : filled === 3 ? "full" : "partial";

  return (
    <div className={`room-seat ${status}`}>
      <div className="room-number">{roomNumber}</div>
      <div className="beds">
        {[0,1,2].map((i) => {
          const isOcc = !!beds[i];
          const isSel = selected?.roomNo === roomNumber && selected?.bedIndex === i;
          return (
            <div
              key={i}
              className={`bed ${isOcc ? "filled" : ""} ${isSel ? "selected" : ""}`}
              title={isOcc ? "Occupied" : "Click to select"}
              onClick={() => !isOcc && onSelectFreeBed(roomNumber, i)}
            />
          );
        })}
      </div>
    </div>
  );
}
