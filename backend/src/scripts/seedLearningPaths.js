require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/problem');
const LearningPath = require('../models/learningPath');

const BLIND_75_TITLES = [
  'Two Sum', 'Valid Parentheses', 'Best Time to Buy and Sell Stock', 'Valid Anagram',
  'Contains Duplicate', 'Product of Array Except Self', 'Longest Consecutive Sequence',
  'Maximum Subarray', 'Climbing Stairs', 'Valid Palindrome',
  'Longest Substring Without Repeating Characters', 'Minimum Window Substring',
  'Container With Most Water', 'Largest Rectangle in Histogram',
  'Find Minimum in Rotated Sorted Array', '3Sum', 'House Robber', 'Number of 1 Bits',
  'Reverse Bits', 'Coin Change', 'Longest Palindromic Substring', 'Jump Game',
  'Word Break', 'Search in Rotated Sorted Array', 'Single Number', 'Subsets',
  'Merge Intervals', 'Maximum Product Subarray', 'Decode Ways',
];

const NEETCODE_TITLES = [
  'Two Sum', 'Valid Parentheses', 'Best Time to Buy and Sell Stock', 'Valid Anagram',
  'Contains Duplicate', 'Product of Array Except Self', 'Longest Consecutive Sequence',
  'First Missing Positive', 'Sort Colors', 'Longest Common Prefix', 'Majority Element',
  'Remove Duplicates from Sorted Array', 'Best Time to Buy and Sell Stock II',
  'Add Binary', 'Find the Duplicate Number', 'Is Subsequence',
  'Longest Repeating Character Replacement', 'Minimum Window Substring',
  'Subarray Sum Equals K',           // NEW batch 7
  'Two Sum II - Input Array Is Sorted', // NEW batch 7
  'Remove Element',                  // NEW batch 7
  'Longest Turbulent Subarray',      // NEW batch 7
  'Maximum Subarray', 'Group Anagrams', 'Climbing Stairs', 'Valid Palindrome',
  'Longest Substring Without Repeating Characters', 'Container With Most Water',
  'Daily Temperatures', 'Car Fleet', 'Largest Rectangle in Histogram',
  'Evaluate Reverse Polish Notation', // NEW batch 7
  'Find Minimum in Rotated Sorted Array', 'Search Insert Position', 'Sqrt(x)',
  'Find Peak Element', 'Koko Eating Bananas',
  'Median of Two Sorted Arrays',     // NEW batch 7
  '3Sum', 'House Robber', 'Number of 1 Bits', 'Reverse Bits', 'Sum of Two Integers',
  'Coin Change', 'Longest Palindromic Substring', 'Counting Bits', 'Jump Game',
  'Unique Paths', 'Word Break', 'Happy Number', 'Search in Rotated Sorted Array',
  'Longest Increasing Subsequence', 'Palindromic Substrings',
  'Top K Frequent Elements', 'Kth Largest Element in an Array',
  'Task Scheduler',                   // NEW batch 7
  'K Closest Points to Origin',       // NEW batch 7
  'Single Number', 'Move Zeroes', 'Plus One', 'Subsets', 'Merge Intervals',
  'Insert Interval', 'Non-overlapping Intervals', 'Meeting Rooms', 'Meeting Rooms II',
  'Maximum Product Subarray', 'Jump Game II', 'House Robber II',
  'Partition Equal Subset Sum', 'Longest Common Subsequence', 'Decode Ways',
  'Gas Station', 'Last Stone Weight', 'Trapping Rain Water', 'Reverse Integer',
  'Palindrome Number', 'Pow(x, n)', 'Best Time to Buy and Sell Stock III',
  'Best Time to Buy and Sell Stock IV', 'Next Permutation',
  'Search a 2D Matrix', 'Multiply Strings', 'Zigzag Conversion',
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
  console.log(`📊 ${allProblems.length} problems in DB\n`);

  let order = 0;
  let created = 0;

  const blind75Ids = BLIND_75_TITLES.map((t) => titleMap[t]?._id).filter(Boolean);
  if (blind75Ids.length > 0) {
    await LearningPath.create({ name: 'Blind 75', slug: 'blind-75', description: 'The famous 75 problems that cover every essential DSA pattern.', type: 'curated', problemIds: blind75Ids, expectedTotal: 75, order: order++ });
    console.log(`✅ Blind 75 — ${blind75Ids.length}/75 available`);
    created++;
  }

  const neetcodeIds = NEETCODE_TITLES.map((t) => titleMap[t]?._id).filter(Boolean);
  if (neetcodeIds.length > 0) {
    await LearningPath.create({ name: 'NeetCode 150', slug: 'neetcode-150', description: 'A curated list of 150 problems that covers every concept you need for coding interviews.', type: 'curated', problemIds: neetcodeIds, expectedTotal: 150, order: order++ });
    console.log(`✅ NeetCode 150 — ${neetcodeIds.length}/150 available`);
    created++;
  }

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
      console.log(`⏭️  Skipping ${topic.name} (only ${matching.length})`);
      continue;
    }

    await LearningPath.create({ name: topic.name, slug: topic.slug, description: topic.description, type: 'topic', problemIds: matching, expectedTotal: matching.length, order: order++ });
    console.log(`✅ ${topic.name} — ${matching.length} problems`);
    created++;
  }

  console.log(`\n🎉 Created ${created} paths`);
  process.exit(0);
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}