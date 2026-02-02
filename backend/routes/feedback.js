const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");

// POST /api/feedback
router.post("/", async (req, res) => {
  const { name, roll_no, department, room_no, feedback_type, message, urgency } = req.body;

  if (!name || !roll_no || !department || !feedback_type || !message || !urgency) {
    return res.status(400).json({ error: "All required fields must be provided" });
  }

  try {
    const { data, error } = await supabase.from("feedbacks").insert([{
      name,
      roll_no,
      department,
      room_no: room_no || null,
      feedback_type,
      urgency,
      message,
      status: "pending",
    }]);

    if (error) throw error;

    res.status(201).json({ message: "Feedback submitted successfully", feedback: data });
  } catch (err) {
    console.error("Error submitting feedback:", err.message);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

module.exports = router;
