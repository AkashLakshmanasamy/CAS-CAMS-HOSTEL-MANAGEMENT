const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");

// GET /api/room/allocations?hostel=...&floor=...
router.get("/allocations", async (req, res) => {
    const { hostel, floor } = req.query;

    if (!hostel || !floor) {
        return res.status(400).json({ error: "Hostel and floor parameters are required" });
    }

    try {
        const { data, error } = await supabase
            .from("allocations")
            .select("room_number, bed_number, status")
            .eq("hostel", hostel)
            .eq("floor", floor)
            .neq("status", "rejected"); // Show pending and approved, skip rejected

        if (error) throw error;

        res.status(200).json(data);
    } catch (err) {
        console.error("Room fetch error:", err.message);
        res.status(500).json({ error: "Failed to fetch room data" });
    }
});

module.exports = router;