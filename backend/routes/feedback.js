const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");

// GET all feedbacks (Admin side)
router.get("/", async (req, res) => {
    const { status, urgency } = req.query;
    try {
        let query = supabase.from("feedbacks").select("*").order("created_at", { ascending: false });

        if (status && status !== "all") query = query.eq("status", status);
        if (urgency && urgency !== "all") query = query.eq("urgency", urgency);

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new feedback (Student side)
router.post("/", async (req, res) => {
    const { name, roll_no, department, room_no, feedback_type, message, urgency } = req.body;
    try {
        const { data, error } = await supabase.from("feedbacks").insert([{
            name, roll_no, department, room_no, feedback_type, message, urgency, status: "pending"
        }]);
        if (error) throw error;
        res.status(201).json({ message: "Feedback submitted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH status (Admin Resolve/Unresolve)
router.patch("/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const { error } = await supabase.from("feedbacks").update({ status }).eq("id", id);
        if (error) throw error;
        res.json({ message: "Status updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE feedback
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from("feedbacks").delete().eq("id", id);
        if (error) throw error;
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;