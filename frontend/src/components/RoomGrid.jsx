import React from "react";
import RoomSeat from "./RoomSeat";
import "../styles/RoomGrid.css";

export default function RoomGrid({
  hostel,
  floor,
  rooms,               // array of room numbers (strings)
  getBeds,             // (roomNo) => [bool,bool,bool]
  onSelectFreeBed,     // (roomNo, bedIndex)
  selected,            // {roomNo, bedIndex} | null
}) {
  return (
    <section>
      <h3 className="grid__title">{hostel} • {floor} Floor</h3>
      <div className="room-grid">
        {rooms.map((roomNo) => (
          <RoomSeat
            key={roomNo}
            roomNumber={roomNo}
            beds={getBeds(roomNo)}
            onSelectFreeBed={onSelectFreeBed}
            selected={selected}
          />
        ))}
      </div>
    </section>
  );
}
