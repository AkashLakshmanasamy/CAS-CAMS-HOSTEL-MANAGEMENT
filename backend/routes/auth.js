const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Email, password, and role required" });
  }

  // 1️⃣ Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Return user with role so frontend can navigate
  res.json({ 
    user: { 
      id: data.user.id, 
      email: data.user.email, 
      role: role 
    } 
  });
});

// POST /api/auth/login (Standard Login)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return res.status(401).json({ error: error?.message || "Login failed" });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const userRole = profile?.role || "student";

  res.json({
    user: { ...data.user, role: userRole },
    session: data.session,
  });
});

module.exports = router;