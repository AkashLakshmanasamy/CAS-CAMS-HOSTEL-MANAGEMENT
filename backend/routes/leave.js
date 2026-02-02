const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   POST /api/leave
// @desc    Submit a new leave application with signature
router.post("/", upload.single("studentSignature"), async (req, res) => {
  const {
    name, rollNumber, branch, year, semester,
    hostelName, roomNumber, date, time, reason,
    studentMobile, parentMobile, informedAdvisor,
    advisorName, advisorMobile, email, userId
  } = req.body;

  try {
    let signatureUrl = null;
    if (req.file) {
      const fileName = `signatures/${Date.now()}_${rollNumber}`;
      const { error: uploadError } = await supabase.storage
        .from("leave-signatures")
        .upload(fileName, req.file.buffer, { 
            contentType: req.file.mimetype,
            upsert: true 
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("leave-signatures")
        .getPublicUrl(fileName);

      signatureUrl = publicUrlData.publicUrl;
    }

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
      status: "pending"
    }]).select();

    if (error) throw error;
    res.status(201).json({ message: "Success", leave: data[0] });

  } catch (err) {
    console.error("Leave Post Error:", err.message);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

// @route   GET /api/leave
// @desc    Admin: Fetch all applications | Student: Fetch by email query
router.get("/", async (req, res) => {
  const { email } = req.query;
  try {
    let query = supabase.from("leave_applications").select("*").order("created_at", { ascending: false });
    
    if (email) query = query.eq("email", email);

    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PATCH /api/leave/:id
// @desc    Update status (Approve/Reject)
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, admin_signature_url } = req.body;

  try {
    const { data, error } = await supabase
      .from("leave_applications")
      .update({ 
        status: status, 
        admin_signature_url: admin_signature_url 
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;