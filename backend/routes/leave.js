const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");
const multer = require("multer");

// Configure multer for file uploads (in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/leave
router.post("/", upload.single("studentSignature"), async (req, res) => {
  const {
    name, rollNumber, branch, year, semester,
    hostelName, roomNumber, date, time, reason,
    studentMobile, parentMobile, informedAdvisor,
    advisorName, advisorMobile, email, userId
  } = req.body;

  if (!name || !rollNumber || !branch || !year || !semester || !hostelName || !roomNumber || !date || !time || !reason || !studentMobile || !parentMobile || !informedAdvisor || !email || !userId) {
    return res.status(400).json({ error: "All required fields must be provided" });
  }

  try {
    // --- Upload signature to Supabase storage ---
    let signatureUrl = null;
    if (req.file) {
      const fileName = `signatures/${email.split("@")[0]}_${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from("leave-signatures")
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("leave-signatures")
        .getPublicUrl(fileName);

      signatureUrl = publicUrlData.publicUrl;
    }

    // --- Insert into Supabase table ---
    const { data, error } = await supabase.from("leave_applications").insert([{
      email,
      user_id: userId,
      name,
      roll_number: rollNumber,
      branch,
      year,
      semester,
      hostel_name: hostelName,
      room_number: roomNumber,
      date_of_stay: date,
      time,
      reason,
      student_mobile: studentMobile,
      parent_mobile: parentMobile,
      informed_advisor: informedAdvisor,
      advisor_name: advisorName || null,
      advisor_mobile: advisorMobile || null,
      student_signature_url: signatureUrl,
      status: "Pending"
    }]);

    if (error) throw error;
    res.status(201).json({ message: "Leave application submitted successfully", leave: data });

  } catch (err) {
    console.error("Error submitting leave application:", err.message);
    res.status(500).json({ error: "Failed to submit leave application" });
  }
});

// GET /api/leave?email=...
router.get("/", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const { data, error } = await supabase
      .from("leave_applications")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json({ history: data });

  } catch (err) {
    console.error("Error fetching leave history:", err.message);
    res.status(500).json({ error: "Failed to fetch leave history" });
  }
});

module.exports = router;
