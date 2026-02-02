const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");

// GET /api/rooms/allocations?hostel=...&floor=...
router.get("/allocations", async (req, res) => {
  const { hostel, floor } = req.query;

  try {
    const { data, error } = await supabase
      .from("allocations")
      .select("room_number, bed_number, status")
      .eq("hostel", hostel)
      .eq("floor", floor)
      .neq("status", "rejected"); // Filter out rejected ones

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error("Room fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch room data" });
  }
});

module.exports = router; 