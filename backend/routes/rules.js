const express = require('express');
const router = express.Router();
const supabase = require("../utils/supabaseClient");

// GET: Fetch rules
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("hostel_rules")
            .select("*")
            .eq("id", 1)
            .maybeSingle();

        if (error) throw error;

        // Default structure if DB is empty
        const defaults = {
            id: 1,
            general_rules: [],
            mess_timings: { breakfast: "", lunch: "", snacks: "", dinner: "" },
            gate_timings: { opening: "", curfew_regular: "" },
            prohibited_items: { electrical: [], restricted: [] },
            consequences: []
        };

        res.json(data || defaults);
    } catch (err) {
        console.error("GET Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update rules
router.put('/', async (req, res) => {
    try {
        console.log("Received update request:", req.body);
        const { data, error } = await supabase
            .from("hostel_rules")
            .upsert({ id: 1, ...req.body }, { onConflict: 'id' })
            .select();

        if (error) throw error;
        res.json({ message: "Success", data });
    } catch (err) {
        console.error("PUT Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;