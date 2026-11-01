// backend/src/scripts/seedEditorialResources.js
require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/problem');
const editorialData = require('./editorialResources');

async function main() {
  await mongoose.connect(process.env.DB_CONNECT_STRING);
  console.log('✅ Connected to MongoDB:', mongoose.connection.name, '\n');

  const totalProblems = await Problem.countDocuments();
  console.log(`   ${totalProblems} problems in DB\n`);

  let updated = 0;
  let notFound = 0;
  const missing = [];

  for (const entry of editorialData) {
    const problem = await Problem.findOne({ title: entry.title });

    if (!problem) {
      console.log(`   ⚠️  "${entry.title}" — not found, skipping`);
      notFound++;
      missing.push(entry.title);
      continue;
    }

    // Replace entire array (idempotent — safe to re-run)
    problem.editorialResources = entry.resources.map((r) => ({
      type: r.type,
      url: r.url,
      title: r.title,
      author: r.author || '',
    }));

    await problem.save();
    console.log(`   ✅ ${entry.title} — ${entry.resources.length} resources`);
    updated++;
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`🎉 Done.`);
  console.log(`   ✅ Updated: ${updated} problems`);
  if (notFound > 0) {
    console.log(`\n   ⚠️  Not found: ${notFound} problems`);
    console.log(`      These titles in editorialResources.js don't match your DB:`);
    missing.forEach((t) => console.log(`      - "${t}"`));
    console.log(`\n      Fix: either change the DB title to match, or update the`);
    console.log(`      title in editorialResources.js to match your DB.`);
  }

  process.exit(0);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  });
}