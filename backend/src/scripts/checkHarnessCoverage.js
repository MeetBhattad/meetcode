require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/problem');

// ── Blind 75 titles ─────────────────────────────────────────
const BLIND_75 = [
  'Two Sum','Valid Parentheses','Merge Two Sorted Lists','Best Time to Buy and Sell Stock',
  'Valid Palindrome','Valid Anagram','Contains Duplicate','Product of Array Except Self',
  'Maximum Subarray','Maximum Product Subarray','Find Minimum in Rotated Sorted Array',
  'Search in Rotated Sorted Array','3Sum','Container With Most Water',
  'Sum of Two Integers','Missing Number','Reverse Bits','Number of 1 Bits','Counting Bits',
  'Longest Substring Without Repeating Characters','Longest Repeating Character Replacement',
  'Longest Palindromic Substring','Palindromic Substrings','Minimum Window Substring',
  'Group Anagrams','Merge Intervals','Non-overlapping Intervals','Insert Interval',
  'Meeting Rooms','Meeting Rooms II','Jump Game','Jump Game II','Climbing Stairs',
  'Coin Change','Longest Increasing Subsequence','Word Break','Decode Ways',
  'Combination Sum','House Robber','House Robber II','Unique Paths',
  'Reverse Linked List','Linked List Cycle','Remove Nth Node From End of List','Reorder List',
  'Invert Binary Tree','Maximum Depth of Binary Tree','Diameter of Binary Tree',
  'Balanced Binary Tree','Same Tree','Subtree of Another Tree',
  'Lowest Common Ancestor of a Binary Search Tree','Binary Tree Level Order Traversal',
  'Binary Tree Right Side View','Count Good Nodes in Binary Tree',
  'Validate Binary Search Tree','Kth Smallest Element in a BST',
  'Construct Binary Tree from Preorder and Inorder Traversal','Binary Tree Maximum Path Sum',
  'Serialize and Deserialize Binary Tree','Implement Trie (Prefix Tree)',
  'Design Add and Search Words Data Structure','Word Search II',
  'Number of Islands','Clone Graph','Pacific Atlantic Water Flow','Course Schedule',
  'Graph Valid Tree','Connected Components in an Undirected Graph','Alien Dictionary','Word Ladder',
  'Spiral Matrix','Rotate Image','Set Matrix Zeroes','LRU Cache','Min Stack',
  'Time Based Key-Value Store','Task Scheduler','Design Twitter','K Closest Points to Origin',
  'Trapping Rain Water','Reverse Integer','Palindrome Number','Pow(x, n)','Next Permutation',
  'Search a 2D Matrix','Multiply Strings','Zigzag Conversion',
];

// ── NeetCode 150 (subset not already in Blind 75) ───────────
const NEETCODE_EXTRA = [
  'Subarray Sum Equals K','Median of Two Sorted Arrays','Longest Turbulent Subarray',
  'Generate Parentheses','Remove Element','Combination Sum II','Permutations','Subsets II',
  'Letter Combinations of a Phone Number','Word Search','Valid Sudoku',
  'Lowest Common Ancestor of a Binary Tree','Binary Tree Zigzag Level Order Traversal',
  'Course Schedule II','Surrounded Regions','Rotting Oranges','Walls and Gates',
  'Evaluate Reverse Polish Notation','Daily Temperatures','Car Fleet',
  'Largest Rectangle in Histogram','Koko Eating Bananas','Search Insert Position',
  'Find Peak Element','Sqrt(x)','First Missing Positive','Sort Colors',
  'Longest Common Prefix','Majority Element','Remove Duplicates from Sorted Array',
  'Best Time to Buy and Sell Stock II','Best Time to Buy and Sell Stock III',
  'Best Time to Buy and Sell Stock IV','Longest Consecutive Sequence','Is Subsequence',
  'Isomorphic Strings','Ransom Note','Add Binary','Find the Duplicate Number',
  'Third Maximum Number','Reverse Vowels of a String','Robot Return to Origin',
  'Jewels and Stones','Valid Mountain Array','Fibonacci Number','Last Stone Weight',
  'Kth Largest Element in an Array','Partition Equal Subset Sum','Gas Station',
  'Meeting Rooms III','Find All Numbers Disappeared in an Array',
];

const ALL_TITLES = [...new Set([...BLIND_75, ...NEETCODE_EXTRA])];

function hasFullHarness(p) {
  return (
    Array.isArray(p.visibleTestCases) && p.visibleTestCases.length > 0 &&
    Array.isArray(p.hiddenTestCases) && p.hiddenTestCases.length > 0 &&
    Array.isArray(p.referenceSolution) && p.referenceSolution.length >= 3 &&
    Array.isArray(p.testHarness) && p.testHarness.length >= 3
  );
}

async function main() {
  await mongoose.connect(process.env.DB_CONNECT_STRING);
  console.log('✅ Connected to MongoDB\n');

  const docs = await Problem.find(
    { title: { $in: ALL_TITLES } },
    { title: 1, problemNumber: 1, visibleTestCases: 1, hiddenTestCases: 1, referenceSolution: 1, testHarness: 1 }
  ).lean();

  const byTitle = {};
  docs.forEach((d) => { byTitle[d.title] = d; });

  const fullyRunnable = [];
  const metadataOnly = [];
  const missing = [];

  for (const title of ALL_TITLES) {
    const doc = byTitle[title];
    if (!doc) missing.push(title);
    else if (hasFullHarness(doc)) fullyRunnable.push(title);
    else metadataOnly.push(title);
  }

  console.log('📊 Coverage Report\n');
  console.log(`   Fully runnable:  ${fullyRunnable.length}`);
  console.log(`   Metadata only:   ${metadataOnly.length}`);
  console.log(`   Not in DB:       ${missing.length}`);
  console.log(`   Total checked:   ${ALL_TITLES.length}\n`);

  console.log('─'.repeat(60));
  console.log('✅ FULLY RUNNABLE PROBLEMS\n');
  fullyRunnable.sort().forEach((t) => console.log(`   ✓ ${t}`));

  console.log('\n' + '─'.repeat(60));
  console.log('⚠️  METADATA ONLY (in DB but not runnable — need harness work)\n');
  metadataOnly.sort().forEach((t) => console.log(`   • ${t}`));

  console.log('\n' + '─'.repeat(60));
  console.log('❌ NOT IN DB AT ALL\n');
  if (missing.length === 0) console.log('   (none)');
  else missing.sort().forEach((t) => console.log(`   ✗ ${t}`));

  process.exit(0);
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}