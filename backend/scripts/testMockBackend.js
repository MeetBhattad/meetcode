// backend/scripts/testMockBackend.js
require('dotenv').config();
const axios = require('axios');

const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const BASE = 'http://localhost:3000';

if (!EMAIL || !PASSWORD) {
  console.error('❌ ADMIN_EMAIL / ADMIN_PASSWORD missing from .env');
  process.exit(1);
}

const run = async () => {
  try {
    console.log('🔐 Logging in...');
    const login = await axios.post(`${BASE}/user/login`, {
      emailId: EMAIL, password: PASSWORD,
    });
    const cookies = login.headers['set-cookie'];
    const client = axios.create({ headers: { Cookie: cookies } });

    console.log('📋 Fetching problems...');
    const { data: problems } = await client.get(`${BASE}/problem/getAllProblem`);
    const problem = problems[0];
    console.log(`   Using: "${problem.title}" (${problem._id})`);

    console.log('\n🎬 Starting session...');
    const start = await client.post(`${BASE}/mock/start`, {
      problemId: problem._id, language: 'python',
    });
    const { sessionId, messages } = start.data;
    console.log(`   Session: ${sessionId}`);
    messages.forEach(m => console.log(`   [${m.role}] ${m.text}`));

    const testResponses = [
      "I'd start with the brute force approach. I'd use two nested loops, checking every pair to see if they sum to the target.",
      "The brute force would be O(n^2) time. I think we can optimize using a hash map that stores the complement.",
      "Right. For each number, I check if target - current is already in the map. If yes, I've found my pair. Otherwise I add the current number and its index.",
      "The time complexity would be O(n) since we do one pass, and space is O(n) for the hash map.",
    ];

    for (let i = 0; i < testResponses.length; i++) {
      const userText = testResponses[i];
      console.log(`\n👤 Candidate: ${userText}`);

      const reply = await client.post(`${BASE}/mock/message`, {
        sessionId, text: userText,
      });
      console.log(`🤖 Interviewer: ${reply.data.reply}`);
    }

    console.log('\n✅ Stage 2 backend test complete.');
    console.log(`   Session saved: ${sessionId}`);
    console.log('   Open MongoDB and inspect `mocksessions` collection to verify persistence.');
  } catch (err) {
    console.error('\n❌ Error:');
    console.error(err.response?.data || err.message);
    process.exit(1);
  }
};

run();