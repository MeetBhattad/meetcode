// backend/scripts/seedDatabase.js
require('dotenv').config();
const axios = require('axios');
const problemsData = require('./problemsData');

const ADMIN_EMAIL = "meetbhattad@gmail.com"; 
const ADMIN_PASSWORD = "Jaibabari@1";
const BACKEND_URL = "http://localhost:3000";

const seedDatabase = async () => {
  try {
    console.log("🔐 Logging in as Admin...");
    const loginRes = await axios.post(`${BACKEND_URL}/user/login`, {
      emailId: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    const cookies = loginRes.headers['set-cookie'];
    if (!cookies) throw new Error("Login failed. Check credentials.");
    console.log("✅ Logged in successfully.\n");

    for (const problem of problemsData) {
      console.log(`📤 Sending "${problem.title}" to backend...`);
      try {
        await axios.post(`${BACKEND_URL}/problem/create`, problem, {
          headers: { Cookie: cookies }
        });
        console.log(`✅ Success! "${problem.title}" saved to database.\n`);
        
        // Wait 5 seconds for Judge0 API rate limit
        await new Promise(r => setTimeout(r, 5000));
      } catch (err) {
        console.error(`❌ Failed to add "${problem.title}":`);
        console.error(err.response?.data?.error || err.message);
        console.log("Skipping to next problem...\n");
      }
    }
    console.log("🎉 Database seeding complete!");
  } catch (err) {
    console.error("❌ Fatal Error:", err.message);
  }
};

seedDatabase();