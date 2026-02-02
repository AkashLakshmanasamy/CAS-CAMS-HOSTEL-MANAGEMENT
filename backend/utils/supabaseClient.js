// supabaseClient.js
require('dotenv').config(); // <-- add this at the top

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or ANON key is missing in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
