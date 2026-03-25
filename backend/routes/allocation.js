const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// 1. VERIFICATION ROUTE
router.get("/test", (req, res) => res.json({ message: "Router is connected!" }));

// ==========================================
// SESSION MANAGEMENT (EXISTING LOGIC)
// ==========================================

// A. GET ALL ACTIVE CONFIGS
router.get("/configs/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("allocations")
      .select("*")
      .eq("status", "system"); 

    if (error) throw error;
    
    const configs = data.map(item => {
      let configDetails = {};
      try {
        configDetails = typeof item.department === 'string' ? JSON.parse(item.department) : item.department;
      } catch (e) {
        console.error("JSON Parsing Error for:", item.reg_no);
        configDetails = { roomsPerFloor: 0, openTime: null, closeTime: null };
      }

      return {
        hostel: item.hostel,
        reg_no: item.reg_no,
        roomsPerFloor: configDetails.roomsPerFloor || 40,
        openTime: configDetails.openTime,
        closeTime: configDetails.closeTime
      };
    });
    
    res.json(configs);
  } catch (err) {
    console.error("Fetch All Configs Error:", err.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// B. DELETE SESSION
router.delete("/config/:reg_no", async (req, res) => {
  try {
    const { error } = await supabase
      .from("allocations")
      .delete()
      .eq("reg_no", req.params.reg_no);

    if (error) throw error;
    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// C. SAVE CONFIGURATION
router.post("/config", async (req, res) => {
  const { hostel, roomsPerFloor, openTime, closeTime } = req.body;
  try {
    const configKey = `CONFIG_${hostel.replace(/\s+/g, '_')}`;
    const configData = { roomsPerFloor, openTime, closeTime };

    const { data, error } = await supabase
      .from("allocations")
      .upsert({
        reg_no: configKey,
        department: JSON.stringify(configData), 
        status: "system",
        hostel: hostel,
        email: `admin_${hostel.toLowerCase().replace(/\s+/g, '_')}@system.com`,
        floor: "N/A",
        room_number: "CONFIG",
        bed_number: 0 
      }, { onConflict: 'reg_no' });

    if (error) throw error;
    res.status(200).json({ message: "Configuration saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// D. GET CONFIGURATION
router.get("/config/:hostel", async (req, res) => {
  try {
    const configKey = `CONFIG_${req.params.hostel.replace(/\s+/g, '_')}`;
    const { data, error } = await supabase
      .from("allocations")
      .select("department")
      .eq("reg_no", configKey)
      .single();

    if (error || !data) return res.json(null);
    
    const parsedData = typeof data.department === 'string' ? JSON.parse(data.department) : data.department;
    res.json(parsedData);
  } catch (err) {
    res.json(null);
  }
});

// ==========================================
// ROOM & STATUS FETCHING
// ==========================================

// 4. GET ALLOCATION STATUS
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

// ==========================================================
// 6. STUDENT SUBMISSION (EXISTING WORKFLOW - REMAINS PENDING)
// ==========================================================
router.post("/", upload.single("receipt"), async (req, res) => {
    try {
        const { email, name, regNo, department, hostel, floor, roomNumber, bedNumber } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ error: "Payment receipt file is required." });

        const filePath = `${Date.now()}_${regNo}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl;

        await supabase.from("allocations").delete().eq("reg_no", regNo).eq("status", "rejected");

        const { data, error } = await supabase
            .from("allocations")
            .insert({
                email, name, reg_no: regNo, department, hostel, floor,
                room_number: roomNumber,
                bed_number: parseInt(bedNumber),
                status: "pending", // Student fill panna eppovum PENDING thaan
                receipt_url: publicUrl
            })
            .select(); 

        if (error) {
            if (error.code === '23505') return res.status(409).json({ error: "An active application already exists." });
            throw error;
        }
        res.status(201).json({ message: "Success", allocation: data[0] });
    } catch (err) {
        console.error("Submit Error:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// ==========================================================
// 7. ADMIN MANUAL FILL (FORCED APPROVED - UPDATED LOGIC)
// ==========================================================
router.post("/admin-fill", async (req, res) => {
    try {
        const { email, name, regNo, department, hostel, floor, roomNumber, bedNumber } = req.body;

        const { data: check } = await supabase
            .from("allocations")
            .select("id")
            .eq("hostel", hostel)
            .eq("floor", floor)
            .eq("room_number", roomNumber)
            .eq("bed_number", parseInt(bedNumber))
            .neq("status", "rejected")
            .neq("status", "system")
            .maybeSingle();

        if (check) return res.status(400).json({ error: "This bed was just taken by someone else!" });

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
                // 🚀 Ippo Inga status force panrom, so student profile-la direct-ah green color-la PAID nu kaatum
                status: "approved", 
                receipt_url: "ADMIN_ALLOCATED"
            })
            .select();

        if (error) {
            if (error.code === '23505') return res.status(409).json({ error: "Student already has an allocation." });
            throw error;
        }

        res.status(201).json({ message: "Room Allocated Successfully by Admin", allocation: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;