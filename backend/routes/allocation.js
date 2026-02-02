const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// POST: Create Allocation
router.post("/", upload.single("receipt"), async (req, res) => {
  const { email, name, regNo, department, feesStatus, hostel, floor, roomNumber, bedNumber } = req.body;

  try {
    let receipt_url = null;
    if (req.file) {
      const fileName = `receipts/${regNo}_${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(fileName);
      receipt_url = urlData.publicUrl;
    }

    const { data, error } = await supabase.from("allocations").insert([{
      email, name, reg_no: regNo, department, fees_status: feesStatus,
      hostel, floor, room_number: roomNumber, bed_number: parseInt(bedNumber),
      receipt_url, status: "pending"
    }]);

    if (error) throw error;
    res.status(201).json({ message: "Applied successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Check Occupied Beds
router.get("/occupied", async (req, res) => {
  const { hostel, floor } = req.query;
  const { data, error } = await supabase
    .from("allocations")
    .select("room_number, bed_number")
    .eq("hostel", hostel)
    .eq("floor", floor)
    .neq("status", "rejected");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET: Single user status
router.get("/status", async (req, res) => {
  const { email } = req.query;
  const { data, error } = await supabase.from("allocations").select("*").eq("email", email).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ allocation: data });
});

module.exports = router;