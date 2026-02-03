const express = require("express");
const router = express.Router(); // <--- This MUST be before any router.get/post
const supabase = require("../utils/supabaseClient");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// 1. Test Route (Verification)
router.get("/test", (req, res) => res.json({ message: "Router is connected!" }));

// 2. GET ALLOCATION STATUS
router.get("/status", async (req, res) => {
  const { email } = req.query;
  try {
    const { data, error } = await supabase
      .from("allocations")
      .select("*")
      .eq("email", email)
      .neq("status", "system") 
      .maybeSingle();

    if (error) throw error;
    res.json({ allocation: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. SUBMIT NEW ALLOCATION
router.post("/", upload.single("receipt"), async (req, res) => {
  try {
    const { email, name, regNo, department, hostel, floor, roomNumber, bedNumber } = req.body;
    
    const { data, error } = await supabase
      .from("allocations")
      .insert({
        email,
        name,
        reg_no: regNo,
        department,
        hostel,
        floor,
        room_number: roomNumber,
        bed_number: parseInt(bedNumber),
        status: "pending",
        receipt_url: "uploaded_link_here" 
      });

    if (error) throw error;
    res.status(201).json({ message: "Success", allocation: data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. GET CONFIGURATION
router.get("/config/:hostel", async (req, res) => {
  try {
    const configKey = `CONFIG_${req.params.hostel.replace(/\s+/g, '_')}`;
    const { data, error } = await supabase
      .from("allocations")
      .select("department")
      .eq("reg_no", configKey)
      .single();

    if (error || !data) return res.json(null);
    res.json(JSON.parse(data.department));
  } catch (err) {
    res.json(null);
  }
});

// 5. GET OCCUPIED BEDS
router.get("/occupied", async (req, res) => {
  const { hostel, floor } = req.query;
  try {
    const { data, error } = await supabase
      .from("allocations")
      .select("room_number, bed_number")
      .eq("hostel", hostel)
      .eq("floor", floor)
      .neq("status", "rejected")
      .neq("status", "system");

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;