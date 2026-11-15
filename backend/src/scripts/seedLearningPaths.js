require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/problem');
const LearningPath = require('../models/learningPath');

const BLIND_75_TITLES = [
  'Two Sum', 'Best Time to Buy and Sell Stock', 'Contains Duplicate', 'Product of Array Except Self', 
  'Maximum Subarray', 'Maximum Product Subarray', 'Find Minimum in Rotated Sorted Array', 
  'Search in Rotated Sorted Array', '3Sum', 'Container With Most Water',
  'Sum of Two Integers', 'Number of 1 Bits', 'Counting Bits', 'Missing Number', 'Reverse Bits',
  'Climbing Stairs', 'Coin Change', 'Longest Increasing Subsequence', 'Longest Common Subsequence', 
  'Word Break', 'Combination Sum', 'House Robber', 'House Robber II', 'Decode Ways', 'Unique Paths', 'Jump Game',
  'Clone Graph', 'Course Schedule', 'Pacific Atlantic Water Flow', 'Number of Islands', 
  'Longest Consecutive Sequence', 'Alien Dictionary', 'Graph Valid Tree', 
  'Number of Connected Components in an Undirected Graph', 'Word Ladder',
  'Insert Interval', 'Merge Intervals', 'Non-overlapping Intervals', 'Meeting Rooms', 'Meeting Rooms II',
  'Reverse Linked List', 'Linked List Cycle', 'Merge Two Sorted Lists', 'Merge k Sorted Lists', 
  'Remove Nth Node From End of List', 'Reorder List',
  'Set Matrix Zeroes', 'Spiral Matrix', 'Rotate Image', 'Word Search',
  'Longest Substring Without Repeating Characters', 'Longest Repeating Character Replacement', 
  'Minimum Window Substring', 'Valid Anagram', 'Valid Palindrome', 'Group Anagrams',
  'Maximum Depth of Binary Tree', 'Same Tree', 'Invert Binary Tree', 'Binary Tree Maximum Path Sum', 
  'Binary Tree Level Order Traversal', 'Serialize and Deserialize Binary Tree', 'Subtree of Another Tree', 
  'Construct Binary Tree from Preorder and Inorder Traversal', 'Validate Binary Search Tree', 
  'Kth Smallest Element in a BST', 'Lowest Common Ancestor of a Binary Search Tree', 
  'Implement Trie (Prefix Tree)', 'Design Add and Search Words Data Structure', 'Word Search II',
  'Top K Frequent Elements', 'Find Median from Data Stream',
  'Valid Parentheses', 'LRU Cache', 'Min Stack'
];

const NEETCODE_150_TITLES = [
  // Arrays & Hashing (9)
  'Contains Duplicate', 'Valid Anagram', 'Two Sum', 'Group Anagrams', 'Top K Frequent Elements', 'Product of Array Except Self', 'Valid Sudoku', 'Encode and Decode Strings', 'Longest Consecutive Sequence',
  // Two Pointers (5)
  'Valid Palindrome', 'Two Sum II - Input Array Is Sorted', '3Sum', 'Container With Most Water', 'Trapping Rain Water',
  // Sliding Window (6)
  'Best Time to Buy and Sell Stock', 'Longest Substring Without Repeating Characters', 'Longest Repeating Character Replacement', 'Permutation in String', 'Minimum Window Substring', 'Sliding Window Maximum',
  // Stack (7)
  'Valid Parentheses', 'Min Stack', 'Evaluate Reverse Polish Notation', 'Daily Temperatures', 'Car Fleet', 'Largest Rectangle in Histogram', 'Implement Queue using Stacks',
  // Binary Search (7)
  'Binary Search', 'Search a 2D Matrix', 'Koko Eating Bananas', 'Find Minimum in Rotated Sorted Array', 'Search in Rotated Sorted Array', 'Time Based Key-Value Store', 'Median of Two Sorted Arrays',
  // Linked List (11)
  'Reverse Linked List', 'Merge Two Sorted Lists', 'Reorder List', 'Remove Nth Node From End of List', 'Copy List with Random Pointer', 'Add Two Numbers', 'Linked List Cycle', 'Find the Duplicate Number', 'LRU Cache', 'Merge k Sorted Lists', 'Reverse Nodes in k-Group',
  // Trees (15)
  'Invert Binary Tree', 'Maximum Depth of Binary Tree', 'Diameter of Binary Tree', 'Balanced Binary Tree', 'Same Tree', 'Subtree of Another Tree', 'Lowest Common Ancestor of a Binary Search Tree', 'Binary Tree Level Order Traversal', 'Binary Tree Right Side View', 'Count Good Nodes in Binary Tree', 'Validate Binary Search Tree', 'Kth Smallest Element in a BST', 'Construct Binary Tree from Preorder and Inorder Traversal', 'Binary Tree Maximum Path Sum', 'Serialize and Deserialize Binary Tree',
  // Tries (3)
  'Implement Trie (Prefix Tree)', 'Design Add and Search Words Data Structure', 'Word Search II',
  // Heap / Priority Queue (7)
  'Kth Largest Element in an Array', 'Last Stone Weight', 'K Closest Points to Origin', 'Task Scheduler', 'Design Twitter', 'Find Median from Data Stream', 'Kth Largest Element in a Stream',
  // Backtracking (9)
  'Subsets', 'Combination Sum', 'Permutations', 'Subsets II', 'Combination Sum II', 'Word Search', 'Palindrome Partitioning', 'Letter Combinations of a Phone Number', 'N-Queens',
  // Graphs (13)
  'Number of Islands', 'Clone Graph', 'Max Area of Island', 'Pacific Atlantic Water Flow', 'Surrounded Regions', 'Rotting Oranges', 'Course Schedule', 'Course Schedule II', 'Graph Valid Tree', 'Number of Connected Components in an Undirected Graph', 'Redundant Connection', 'Word Ladder', 'Evaluate Division',
  // Advanced Graphs (6)
  'Reconstruct Itinerary', 'Min Cost to Connect All Points', 'Network Delay Time', 'Swim in Rising Water', 'Alien Dictionary', 'Cheapest Flights Within K Stops',
  // 1-D DP (12)
  'Climbing Stairs', 'Min Cost Climbing Stairs', 'House Robber', 'House Robber II', 'Longest Palindromic Substring', 'Palindromic Substrings', 'Decode Ways', 'Coin Change', 'Maximum Product Subarray', 'Word Break', 'Longest Increasing Subsequence', 'Partition Equal Subset Sum',
  // 2-D DP (11)
  'Unique Paths', 'Longest Common Subsequence', 'Best Time to Buy and Sell Stock with Cooldown', 'Coin Change II', 'Target Sum', 'Interleaving String', 'Longest Increasing Path in a Matrix', 'Distinct Subsequences', 'Edit Distance', 'Burst Balloons', 'Regular Expression Matching',
  // Greedy (8)
  'Maximum Subarray', 'Jump Game', 'Jump Game II', 'Gas Station', 'Hand of Straights', 'Merge Triplets to Form Target Triplet', 'Partition Labels', 'Valid Parenthesis String',
  // Intervals (6)
  'Insert Interval', 'Merge Intervals', 'Non-overlapping Intervals', 'Meeting Rooms', 'Meeting Rooms II', 'Minimum Interval to Include Each Query',
  // Math & Geometry (8)
  'Rotate Image', 'Spiral Matrix', 'Set Matrix Zeroes', 'Happy Number', 'Plus One', 'Pow(x, n)', 'Multiply Strings', 'Detect Squares',
  // Bit Manipulation (7)
  'Single Number', 'Number of 1 Bits', 'Counting Bits', 'Reverse Bits', 'Missing Number', 'Sum of Two Integers', 'Reverse Integer'
];

const TOPIC_PATHS = [
  { name: 'Arrays & Hashing', slug: 'arrays-hashing', tags: ['array', 'hashMap'], description: 'Master the fundamentals of array manipulation and hash-based lookups.' },
  { name: 'Two Pointers', slug: 'two-pointers', tags: ['twoPointers'], description: 'Learn the two-pointer technique — a powerful optimization for linear scans.' },
  { name: 'Sliding Window', slug: 'sliding-window', tags: ['slidingWindow'], description: 'Solve problems with contiguous subarrays and substrings efficiently.' },
  { name: 'Stack', slug: 'stack', tags: ['stack'], description: 'Master the LIFO pattern used in parsing, backtracking, and expression evaluation.' },
  { name: 'Binary Search', slug: 'binary-search', tags: ['binarySearch'], description: 'Classic O(log n) searching. Learn to recognize when to apply it.' },
  { name: 'Trees', slug: 'trees', tags: ['tree'], description: 'Master binary tree traversal, recursion, and BST properties.' },
  { name: 'Graphs', slug: 'graphs', tags: ['graph'], description: 'BFS, DFS, topological sort, and grid traversal patterns.' },
  { name: 'Linked List', slug: 'linked-list', tags: ['linkedList'], description: 'Master pointer manipulation and linked list traversal.' },
  { name: 'Dynamic Programming', slug: 'dynamic-programming', tags: ['dp'], description: 'The hardest pattern for most. Learn to spot overlapping subproblems.' },
  { name: 'Bit Manipulation', slug: 'bit-manipulation', tags: ['bitManipulation'], description: 'Master bitwise tricks that make solutions elegant and fast.' },
  { name: 'Math', slug: 'math', tags: ['math'], description: 'Number theory fundamentals used in interview problems.' },
  { name: 'Strings', slug: 'strings', tags: ['string'], description: 'String manipulation, parsing, and pattern matching.' },
  { name: 'Backtracking', slug: 'backtracking', tags: ['backtracking'], description: 'Systematic exploration of all solutions to a problem.' },
  { name: 'Intervals', slug: 'intervals', tags: ['intervals'], description: 'Merge, insert, and analyze interval-based problems.' },
  { name: 'Heap', slug: 'heap', tags: ['heap'], description: 'Priority-queue patterns for top-K and streaming problems.' },
  { name: 'Greedy', slug: 'greedy', tags: ['greedy'], description: 'Locally optimal choices that lead to global optimums.' },
  { name: 'Trie', slug: 'trie', tags: ['trie'], description: 'Prefix trees for efficient string searching and prefix matching.' },
];

const difficultyOrder = { easy: 0, medium: 1, hard: 2 };

function isRunnableProblem(p) {
  return (
    Array.isArray(p.testHarness) && p.testHarness.length >= 3 &&
    Array.isArray(p.visibleTestCases) && p.visibleTestCases.length > 0
  );
}

async function main() {
  await mongoose.connect(process.env.DB_CONNECT_STRING);
  console.log('✅ Connected to MongoDB\n');
  
  await LearningPath.deleteMany({});
  console.log('🗑️  Cleared existing paths\n');

  const allProblems = await Problem.find({})
    .select('_id title tags difficulty problemNumber testHarness visibleTestCases')
    .lean();

  const titleMap = {};
  allProblems.forEach((p) => { titleMap[p.title] = p; });

  const runnableCount = allProblems.filter(isRunnableProblem).length;
  console.log(`📊 ${allProblems.length} problems in DB, ${runnableCount} runnable\n`);

  // 1. Define the unique arrays FIRST
  const uniqueNeetcodeTitles = [...new Set(NEETCODE_150_TITLES)];
  const uniqueBlind75Titles = [...new Set(BLIND_75_TITLES)];

  console.log(`Checked List Sizes: Blind75=${uniqueBlind75Titles.length}, NeetCode150=${uniqueNeetcodeTitles.length}\n`);

  // 2. Now run the debug checks
  const missingBlind75 = uniqueBlind75Titles.filter(t => !titleMap[t] || !isRunnableProblem(titleMap[t]));
  if (missingBlind75.length > 0) {
    console.log(`⚠️ Blind 75 missing/not-runnable (${missingBlind75.length}):`, missingBlind75.join(', '));
  }
  
  const missingNeetcode = uniqueNeetcodeTitles.filter(t => !titleMap[t] || !isRunnableProblem(titleMap[t]));
  if (missingNeetcode.length > 0) {
    console.log(`⚠️ NeetCode 150 missing/not-runnable (${missingNeetcode.length}):`, missingNeetcode.join(', '));
  }
  console.log('');

  let order = 0;
  let created = 0;

  // ── Blind 75 (curated, only runnable) ──
  const blind75Ids = uniqueBlind75Titles
    .map((t) => titleMap[t])
    .filter((p) => p && isRunnableProblem(p))
    .map((p) => p._id);

  if (blind75Ids.length > 0) {
    await LearningPath.create({
      name: 'Blind 75', slug: 'blind-75',
      description: 'The famous 75 problems that cover every essential DSA pattern.',
      type: 'curated', problemIds: blind75Ids, expectedTotal: 75, order: order++,
    });
    console.log(`✅ Blind 75 — ${blind75Ids.length}/75 runnable available`);
    created++;
  }

  // ── NeetCode 150 (curated, only runnable) ──
  const neetcodeIds = uniqueNeetcodeTitles
    .map((t) => titleMap[t])
    .filter((p) => p && isRunnableProblem(p))
    .map((p) => p._id);

  if (neetcodeIds.length > 0) {
    await LearningPath.create({
      name: 'NeetCode 150', slug: 'neetcode-150',
      description: 'A curated list of 150 problems that covers every concept you need for coding interviews.',
      type: 'curated', problemIds: neetcodeIds, expectedTotal: 150, order: order++,
    });
    console.log(`✅ NeetCode 150 — ${neetcodeIds.length}/150 runnable available`);
    created++;
  }

  // ── Topic Tracks (All runnable problems in your DB) ──
  for (const topic of TOPIC_PATHS) {
    const matching = allProblems
      .filter((p) => topic.tags.includes(p.tags) && isRunnableProblem(p))
      .sort((a, b) => {
        const d = (difficultyOrder[a.difficulty] ?? 3) - (difficultyOrder[b.difficulty] ?? 3);
        if (d !== 0) return d;
        return (a.problemNumber || 9999) - (b.problemNumber || 9999);
      })
      .map((p) => p._id);

    if (matching.length < 1) {
      console.log(`⏭️  Skipping ${topic.name} — 0 runnable problems`);
      continue;
    }

    await LearningPath.create({
      name: topic.name, slug: topic.slug, description: topic.description,
      type: 'topic', problemIds: matching, expectedTotal: matching.length, order: order++,
    });
    console.log(`✅ ${topic.name} — ${matching.length} runnable problems`);
    created++;
  }

  console.log(`\n🎉 Created ${created} paths`);
  process.exit(0);
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}