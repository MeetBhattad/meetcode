require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/problem');

// ── Curated company data for your exact problem set ──────────
// Frequencies are 0-100 (higher = asked more often)
// To add a problem later, add a new entry below and re-run the script
const COMPANY_TAGS = {
  "Two Sum": [
    { name: "Amazon", frequency: 100 },
    { name: "Google", frequency: 95 },
    { name: "Microsoft", frequency: 92 },
    { name: "Meta", frequency: 88 },
    { name: "Bloomberg", frequency: 85 },
    { name: "Apple", frequency: 80 },
    { name: "Adobe", frequency: 75 },
  ],
  "Valid Parentheses": [
    { name: "Amazon", frequency: 90 },
    { name: "Google", frequency: 85 },
    { name: "Microsoft", frequency: 85 },
    { name: "Bloomberg", frequency: 80 },
    { name: "Meta", frequency: 75 },
    { name: "Adobe", frequency: 70 },
  ],
  "Best Time to Buy and Sell Stock": [
    { name: "Amazon", frequency: 95 },
    { name: "Google", frequency: 90 },
    { name: "Bloomberg", frequency: 90 },
    { name: "Microsoft", frequency: 85 },
    { name: "Meta", frequency: 82 },
    { name: "Apple", frequency: 70 },
  ],
  "Valid Anagram": [
    { name: "Amazon", frequency: 85 },
    { name: "Bloomberg", frequency: 85 },
    { name: "Google", frequency: 80 },
    { name: "Microsoft", frequency: 75 },
    { name: "Meta", frequency: 70 },
  ],
  "Contains Duplicate": [
    { name: "Amazon", frequency: 80 },
    { name: "Google", frequency: 75 },
    { name: "Meta", frequency: 75 },
    { name: "Microsoft", frequency: 70 },
    { name: "Apple", frequency: 60 },
  ],
  "Product of Array Except Self": [
    { name: "Google", frequency: 85 },
    { name: "Meta", frequency: 82 },
    { name: "Amazon", frequency: 80 },
    { name: "Microsoft", frequency: 75 },
    { name: "Apple", frequency: 70 },
  ],
  "Maximum Subarray": [
    { name: "Amazon", frequency: 90 },
    { name: "Google", frequency: 85 },
    { name: "Bloomberg", frequency: 85 },
    { name: "Microsoft", frequency: 80 },
    { name: "Meta", frequency: 75 },
  ],
  "Group Anagrams": [
    { name: "Meta", frequency: 85 },
    { name: "Amazon", frequency: 80 },
    { name: "Google", frequency: 75 },
    { name: "Bloomberg", frequency: 75 },
    { name: "Microsoft", frequency: 70 },
  ],
  "Climbing Stairs": [
    { name: "Amazon", frequency: 75 },
    { name: "Google", frequency: 70 },
    { name: "Microsoft", frequency: 65 },
    { name: "Meta", frequency: 60 },
    { name: "Apple", frequency: 60 },
  ],
  "Valid Palindrome": [
    { name: "Amazon", frequency: 75 },
    { name: "Google", frequency: 70 },
    { name: "Bloomberg", frequency: 70 },
    { name: "Microsoft", frequency: 65 },
    { name: "Meta", frequency: 65 },
  ],
  "Longest Substring Without Repeating Characters": [
    { name: "Amazon", frequency: 90 },
    { name: "Google", frequency: 90 },
    { name: "Meta", frequency: 88 },
    { name: "Microsoft", frequency: 85 },
    { name: "Bloomberg", frequency: 85 },
    { name: "Adobe", frequency: 75 },
  ],
  "Binary Search": [
    { name: "Amazon", frequency: 85 },
    { name: "Google", frequency: 80 },
    { name: "Microsoft", frequency: 75 },
    { name: "Meta", frequency: 70 },
    { name: "Apple", frequency: 65 },
  ],
  "Container With Most Water": [
    { name: "Amazon", frequency: 85 },
    { name: "Google", frequency: 80 },
    { name: "Meta", frequency: 80 },
    { name: "Microsoft", frequency: 75 },
    { name: "Adobe", frequency: 70 },
  ],
  "Find Minimum in Rotated Sorted Array": [
    { name: "Amazon", frequency: 80 },
    { name: "Google", frequency: 75 },
    { name: "Meta", frequency: 75 },
    { name: "Bloomberg", frequency: 75 },
    { name: "Microsoft", frequency: 70 },
  ],
  "Missing Number": [
    { name: "Amazon", frequency: 70 },
    { name: "Bloomberg", frequency: 70 },
    { name: "Google", frequency: 65 },
    { name: "Meta", frequency: 65 },
    { name: "Microsoft", frequency: 60 },
  ],
  "3Sum": [
    { name: "Amazon", frequency: 90 },
    { name: "Google", frequency: 85 },
    { name: "Meta", frequency: 85 },
    { name: "Bloomberg", frequency: 85 },
    { name: "Microsoft", frequency: 80 },
    { name: "Adobe", frequency: 75 },
  ],
  "House Robber": [
    { name: "Amazon", frequency: 80 },
    { name: "Google", frequency: 75 },
    { name: "Meta", frequency: 75 },
    { name: "Microsoft", frequency: 70 },
    { name: "Bloomberg", frequency: 70 },
  ],
  "Number of 1 Bits": [
    { name: "Amazon", frequency: 75 },
    { name: "Microsoft", frequency: 75 },
    { name: "Google", frequency: 70 },
    { name: "Apple", frequency: 70 },
    { name: "Meta", frequency: 65 },
  ],
  "Coin Change": [
    { name: "Amazon", frequency: 85 },
    { name: "Google", frequency: 80 },
    { name: "Microsoft", frequency: 75 },
    { name: "Meta", frequency: 75 },
    { name: "Bloomberg", frequency: 70 },
  ],
  "Longest Palindromic Substring": [
    { name: "Amazon", frequency: 85 },
    { name: "Adobe", frequency: 80 },
    { name: "Meta", frequency: 80 },
    { name: "Google", frequency: 80 },
    { name: "Microsoft", frequency: 75 },
    { name: "Bloomberg", frequency: 75 },
  ],
  "Counting Bits": [
    { name: "Amazon", frequency: 70 },
    { name: "Google", frequency: 65 },
    { name: "Meta", frequency: 65 },
    { name: "Bloomberg", frequency: 65 },
    { name: "Microsoft", frequency: 60 },
  ],
  "Jump Game": [
    { name: "Amazon", frequency: 80 },
    { name: "Google", frequency: 75 },
    { name: "Microsoft", frequency: 70 },
    { name: "Meta", frequency: 70 },
    { name: "Bloomberg", frequency: 70 },
  ],
  "Unique Paths": [
    { name: "Amazon", frequency: 80 },
    { name: "Google", frequency: 75 },
    { name: "Microsoft", frequency: 75 },
    { name: "Meta", frequency: 75 },
    { name: "Bloomberg", frequency: 65 },
  ],
  "Word Break": [
    { name: "Amazon", frequency: 85 },
    { name: "Google", frequency: 80 },
    { name: "Microsoft", frequency: 75 },
    { name: "Meta", frequency: 75 },
    { name: "Bloomberg", frequency: 75 },
  ],
  "Happy Number": [
    { name: "Amazon", frequency: 70 },
    { name: "Meta", frequency: 70 },
    { name: "Google", frequency: 65 },
    { name: "Bloomberg", frequency: 65 },
    { name: "Microsoft", frequency: 60 },
  ],
  "Search in Rotated Sorted Array": [
    { name: "Amazon", frequency: 85 },
    { name: "Google", frequency: 80 },
    { name: "Meta", frequency: 80 },
    { name: "Microsoft", frequency: 75 },
    { name: "Bloomberg", frequency: 75 },
  ],
  "Longest Increasing Subsequence": [
    { name: "Amazon", frequency: 80 },
    { name: "Google", frequency: 75 },
    { name: "Microsoft", frequency: 70 },
    { name: "Meta", frequency: 70 },
    { name: "Bloomberg", frequency: 70 },
  ],
  "Palindromic Substrings": [
    { name: "Amazon", frequency: 75 },
    { name: "Google", frequency: 70 },
    { name: "Meta", frequency: 70 },
    { name: "Bloomberg", frequency: 70 },
    { name: "Microsoft", frequency: 65 },
  ],
  "Top K Frequent Elements": [
    { name: "Amazon", frequency: 85 },
    { name: "Google", frequency: 80 },
    { name: "Microsoft", frequency: 75 },
    { name: "Meta", frequency: 75 },
    { name: "Bloomberg", frequency: 70 },
  ],
  "Single Number": [
    { name: "Amazon", frequency: 80 },
    { name: "Apple", frequency: 75 },
    { name: "Google", frequency: 75 },
    { name: "Microsoft", frequency: 75 },
    { name: "Meta", frequency: 70 },
    { name: "Bloomberg", frequency: 70 },
  ],
  "Move Zeroes": [
    { name: "Amazon", frequency: 75 },
    { name: "Google", frequency: 65 },
    { name: "Microsoft", frequency: 65 },
    { name: "Meta", frequency: 65 },
    { name: "Bloomberg", frequency: 60 },
  ],
  "Plus One": [
    { name: "Amazon", frequency: 70 },
    { name: "Google", frequency: 65 },
    { name: "Microsoft", frequency: 65 },
    { name: "Apple", frequency: 65 },
    { name: "Meta", frequency: 60 },
  ],
  "Subsets": [
    { name: "Amazon", frequency: 80 },
    { name: "Google", frequency: 75 },
    { name: "Meta", frequency: 75 },
    { name: "Microsoft", frequency: 70 },
    { name: "Bloomberg", frequency: 65 },
  ],
  "Merge Intervals": [
    { name: "Amazon", frequency: 85 },
    { name: "Google", frequency: 80 },
    { name: "Meta", frequency: 80 },
    { name: "Bloomberg", frequency: 80 },
    { name: "Microsoft", frequency: 75 },
    { name: "Adobe", frequency: 75 },
  ],
  "Find All Numbers Disappeared in an Array": [
    { name: "Amazon", frequency: 70 },
    { name: "Google", frequency: 65 },
    { name: "Microsoft", frequency: 65 },
    { name: "Bloomberg", frequency: 65 },
    { name: "Meta", frequency: 60 },
  ],
  "Maximum Product Subarray": [
    { name: "Amazon", frequency: 80 },
    { name: "Google", frequency: 75 },
    { name: "Microsoft", frequency: 70 },
    { name: "Meta", frequency: 70 },
    { name: "Bloomberg", frequency: 70 },
  ],
  "Jump Game II": [
    { name: "Amazon", frequency: 75 },
    { name: "Google", frequency: 70 },
    { name: "Microsoft", frequency: 65 },
    { name: "Meta", frequency: 65 },
    { name: "Bloomberg", frequency: 65 },
  ],
  "House Robber II": [
    { name: "Amazon", frequency: 70 },
    { name: "Google", frequency: 65 },
    { name: "Meta", frequency: 65 },
    { name: "Microsoft", frequency: 60 },
    { name: "Bloomberg", frequency: 60 },
  ],
  "Longest Common Subsequence": [
    { name: "Amazon", frequency: 80 },
    { name: "Google", frequency: 75 },
    { name: "Microsoft", frequency: 70 },
    { name: "Meta", frequency: 70 },
    { name: "Bloomberg", frequency: 65 },
  ],
  "Decode Ways": [
    { name: "Amazon", frequency: 80 },
    { name: "Google", frequency: 75 },
    { name: "Adobe", frequency: 70 },
    { name: "Microsoft", frequency: 70 },
    { name: "Meta", frequency: 70 },
    { name: "Bloomberg", frequency: 70 },
  ],
};

async function main() {
  await mongoose.connect(process.env.DB_CONNECT_STRING);
  console.log('✅ Connected to MongoDB\n');

  let updated = 0;
  let notFound = 0;
  const missing = [];

  for (const [title, companies] of Object.entries(COMPANY_TAGS)) {
    const problem = await Problem.findOne({ title });

    if (!problem) {
      console.log(`   ⚠️  "${title}" — not found in DB, skipping`);
      notFound++;
      missing.push(title);
      continue;
    }

    // Overwrite completely (idempotent)
    problem.companies = companies.map((c) => ({
      name: c.name,
      frequency: c.frequency,
      acceptanceRate: c.acceptanceRate || 0,
      timeframe: 'all',
    }));

    await problem.save();
    console.log(`   ✅ ${title} — ${companies.length} companies`);
    updated++;
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`🎉 Done.`);
  console.log(`   ✅ Updated: ${updated} problems`);
  if (notFound > 0) {
    console.log(`   ⚠️  Not found: ${notFound} problems`);
    console.log(`      These titles aren't in your DB — copy the exact LeetCode title:`);
    missing.forEach((t) => console.log(`      - "${t}"`));
  }

  process.exit(0);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { COMPANY_TAGS };