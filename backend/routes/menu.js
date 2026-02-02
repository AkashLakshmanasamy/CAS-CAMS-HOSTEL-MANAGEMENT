const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient"); 

// GET /api/menu - Fetch the entire weekly menu
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("weekly_menu")
      .select("*");

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error("Fetch Menu Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/menu/:day - Update or Insert menu for a specific day
router.put("/:day", async (req, res) => {
  const { day } = req.params;
  const { morning, breakfast, lunch, evening, dinner } = req.body;

  try {
    // .upsert acts as "Update if exists, else Insert"
    const { data, error } = await supabase
      .from("weekly_menu")
      .upsert({ 
        day, 
        morning, 
        breakfast, 
        lunch, 
        evening, 
        dinner 
      }, { onConflict: 'day' })
      .select();

    if (error) throw error;

    res.status(200).json({ 
      message: `Menu for ${day} updated successfully`, 
      data: data ? data[0] : null 
    });
  } catch (err) {
    console.error("Update Menu Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;