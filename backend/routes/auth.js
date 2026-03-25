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
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  // 2️⃣ IMPORTANT: Profile table-la role-ah insert pannanum
  // Neenga thirumba login pannum pothu role 'student'-nu default-ah pogama irukka idhu dhaan mukkiyam.
  const { error: profileError } = await supabase
    .from("profiles")
    .insert([
      { 
        id: data.user.id, 
        role: role 
      }
    ]);

  if (profileError) {
    // Auth create aagi profile fail aana, andha error-ai handle seivom
    return res.status(400).json({ error: "Auth success, but profile creation failed: " + profileError.message });
  }

  // Success response
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

  // Supabase Auth logic
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return res.status(401).json({ error: error?.message || "Login failed" });
  }

  // Profiles table-la irundhu role-ai edukkirom
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // Profile-la role illai endral mattum default-ah 'student'
  const userRole = profile?.role || "student";

  res.json({
    user: { ...data.user, role: userRole },
    session: data.session,
  });
});

module.exports = router;