const { createClient } = require("@supabase/supabase-js");

// Test different key formats
const url = "https://mpfgkfegtdsycansmdqi.supabase.co";

const keys = [
  "sb_publishable_y8fFPKzJff8PxfLXuELgnA_qx4bJ2Gh",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZmdrZmVndGRzeWNhbnNtZHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MDI0MDAsImV4cCI6MjA1MTk3ODQwMH0.Mg4UKokQRWkzZQK1L5YAw0yfTBw7A6bLo3YjKb_JnNk",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlranZkZW14cmV2Y2dsdWxkbXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTMxOTcsImV4cCI6MjA3MTU4OTE5N30.qi-yxNiFTJkPmk4TRQ-L3Kmj0RtIPmQtk0zFy9UqmrQ"
];

async function testKeys() {
  for (let i = 0; i < keys.length; i++) {
    try {
      console.log(`Testing key ${i + 1}...`);
      const supabase = createClient(url, keys[i]);
      const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
      
      if (error && !error.message.includes('does not exist')) {
        console.log(`Key ${i + 1} failed:`, error.message);
      } else {
        console.log(`Key ${i + 1} works! ✅`);
        console.log('Working key:', keys[i]);
        return;
      }
    } catch (err) {
      console.log(`Key ${i + 1} failed:`, err.message);
    }
  }
}

testKeys();
