// backend/routes/auth.js
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

  // 2️⃣ Insert role in profiles table
  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: data.user.id, role });

    if (profileError) {
      return res.status(500).json({ error: profileError.message });
    }
  }

  // Return user with role
  res.json({ user: { ...data.user, role } });
});

// POST /api/auth/login
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

  // fetch role from profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role || "student";

  res.json({
    user: { ...data.user, role },
    session: data.session,
  });
});

module.exports = router;
