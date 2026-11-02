require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/problem');
const LearningPath = require('../models/learningPath');

// ── Blind 75 — canonical titles that exist in our DB ────────
const BLIND_75_TITLES = [
  'Two Sum',
  'Valid Parentheses',
  'Best Time to Buy and Sell Stock',
  'Valid Anagram',
  'Contains Duplicate',
  'Product of Array Except Self',
  'Maximum Subarray',
  'Climbing Stairs',
  'Valid Palindrome',
  'Longest Substring Without Repeating Characters',
  'Container With Most Water',
  'Find Minimum in Rotated Sorted Array',
  '3Sum',
  'House Robber',
  'Number of 1 Bits',
  'Coin Change',
  'Longest Palindromic Substring',
  'Jump Game',
  'Word Break',
  'Search in Rotated Sorted Array',
  'Single Number',
  'Subsets',
  'Merge Intervals',
  'Maximum Product Subarray',
  'Decode Ways',
];

// ── NeetCode 150 — overlap with our DB ──────────────────────
const NEETCODE_TITLES = [
  'Two Sum',
  'Valid Parentheses',
  'Best Time to Buy and Sell Stock',
  'Valid Anagram',
  'Contains Duplicate',
  'Product of Array Except Self',
  'Maximum Subarray',
  'Group Anagrams',
  'Climbing Stairs',
  'Valid Palindrome',
  'Longest Substring Without Repeating Characters',
  'Container With Most Water',
  'Find Minimum in Rotated Sorted Array',
  '3Sum',
  'House Robber',
  'Number of 1 Bits',
  'Coin Change',
  'Longest Palindromic Substring',
  'Counting Bits',
  'Jump Game',
  'Unique Paths',
  'Word Break',
  'Happy Number',
  'Search in Rotated Sorted Array',
  'Longest Increasing Subsequence',
  'Palindromic Substrings',
  'Top K Frequent Elements',
  'Single Number',
  'Move Zeroes',
  'Plus One',
  'Subsets',
  'Merge Intervals',
  'Maximum Product Subarray',
  'Jump Game II',
  'House Robber II',
  'Longest Common Subsequence',
  'Decode Ways',
];

const TOPIC_PATHS = [
  { name: 'Arrays & Hashing', slug: 'arrays-hashing', tags: ['array', 'hashMap'], description: 'Master the fundamentals of array manipulation and hash-based lookups.' },
  { name: 'Two Pointers', slug: 'two-pointers', tags: ['twoPointers'], description: 'Learn the two-pointer technique — a powerful optimization for linear scans.' },
  { name: 'Sliding Window', slug: 'sliding-window', tags: ['slidingWindow'], description: 'Solve problems with contiguous subarrays and substrings efficiently.' },
  { name: 'Stack', slug: 'stack', tags: ['stack'], description: 'Master the LIFO pattern used in parsing, backtracking, and expression evaluation.' },
  { name: 'Binary Search', slug: 'binary-search', tags: ['binarySearch'], description: 'Classic O(log n) searching. Learn to recognize when to apply it.' },
  { name: 'Dynamic Programming', slug: 'dynamic-programming', tags: ['dp'], description: 'The hardest pattern for most. Learn to spot overlapping subproblems.' },
  { name: 'Bit Manipulation', slug: 'bit-manipulation', tags: ['bitManipulation'], description: 'Master bitwise tricks that make solutions elegant and fast.' },
  { name: 'Math', slug: 'math', tags: ['math'], description: 'Number theory fundamentals used in interview problems.' },
  { name: 'Backtracking', slug: 'backtracking', tags: ['backtracking'], description: 'Systematic exploration of all solutions to a problem.' },
  { name: 'Intervals', slug: 'intervals', tags: ['intervals'], description: 'Merge, insert, and analyze interval-based problems.' },
  { name: 'Heap', slug: 'heap', tags: ['heap'], description: 'Priority-queue patterns for top-K and streaming problems.' },
  { name: 'Greedy', slug: 'greedy', tags: ['greedy'], description: 'Locally optimal choices that lead to global optimums.' },
];

const difficultyOrder = { easy: 0, medium: 1, hard: 2 };

async function main() {
  await mongoose.connect(process.env.DB_CONNECT_STRING);
  console.log('✅ Connected to MongoDB\n');

  await LearningPath.deleteMany({});
  console.log('🗑️  Cleared existing paths\n');

  const allProblems = await Problem.find({}).select('_id title tags difficulty problemNumber');
  const titleMap = {};
  allProblems.forEach((p) => { titleMap[p.title] = p; });

  let order = 0;
  let created = 0;

  // ── Blind 75 ──────────────────────────────────────────
  const blind75Ids = BLIND_75_TITLES.map((t) => titleMap[t]?._id).filter(Boolean);
  if (blind75Ids.length > 0) {
    await LearningPath.create({
      name: 'Blind 75',
      slug: 'blind-75',
      description: 'The famous 75 problems that cover every essential DSA pattern. Handpicked from hundreds of interviews.',
      type: 'curated',
      problemIds: blind75Ids,
      expectedTotal: 75,
      order: order++,
    });
    console.log(`✅ Blind 75 — ${blind75Ids.length}/75 available`);
    created++;
  }

  // ── NeetCode 150 ──────────────────────────────────────
  const neetcodeIds = NEETCODE_TITLES.map((t) => titleMap[t]?._id).filter(Boolean);
  if (neetcodeIds.length > 0) {
    await LearningPath.create({
      name: 'NeetCode 150',
      slug: 'neetcode-150',
      description: 'A curated list of 150 problems that covers every concept you need for coding interviews.',
      type: 'curated',
      problemIds: neetcodeIds,
      expectedTotal: 150,
      order: order++,
    });
    console.log(`✅ NeetCode 150 — ${neetcodeIds.length}/150 available`);
    created++;
  }

  // ── Topic tracks ──────────────────────────────────────
  for (const topic of TOPIC_PATHS) {
    const matching = allProblems
      .filter((p) => topic.tags.includes(p.tags))
      .sort((a, b) => {
        const d = (difficultyOrder[a.difficulty] ?? 3) - (difficultyOrder[b.difficulty] ?? 3);
        if (d !== 0) return d;
        return (a.problemNumber || 9999) - (b.problemNumber || 9999);
      })
      .map((p) => p._id);

    if (matching.length < 2) {
      console.log(`⏭️  Skipping ${topic.name} — only ${matching.length} problem(s)`);
      continue;
    }

    await LearningPath.create({
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      type: 'topic',
      problemIds: matching,
      expectedTotal: matching.length,
      order: order++,
    });
    console.log(`✅ ${topic.name} — ${matching.length} problems`);
    created++;
  }

  console.log(`\n🎉 Created ${created} paths`);
  process.exit(0);
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}