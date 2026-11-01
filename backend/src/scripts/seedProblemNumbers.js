require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/problem');

// Official LeetCode Numbers for your exact problems
const NUMBER_MAP = {
  "Two Sum": 1,
  "Valid Parentheses": 20,
  "Best Time to Buy and Sell Stock": 121,
  "Valid Anagram": 242,
  "Contains Duplicate": 217,
  "Product of Array Except Self": 238,
  "Maximum Subarray": 53,
  "Group Anagrams": 49,
  "Climbing Stairs": 70,
  "Valid Palindrome": 125,
  "Longest Substring Without Repeating Characters": 3,
  "Binary Search": 704,
  "Container With Most Water": 11,
  "Find Minimum in Rotated Sorted Array": 153,
  "Missing Number": 268,
  "3Sum": 15,
  "House Robber": 198,
  "Number of 1 Bits": 191,
  "Coin Change": 322,
  "Longest Palindromic Substring": 5,
  "Counting Bits": 338,
  "Jump Game": 55,
  "Unique Paths": 62,
  "Word Break": 139,
  "Happy Number": 202,
  "Search in Rotated Sorted Array": 33,
  "Longest Increasing Subsequence": 300,
  "Palindromic Substrings": 647,
  "Top K Frequent Elements": 347,
  "Single Number": 136,
  "Move Zeroes": 283,
  "Plus One": 66,
  "Subsets": 78,
  "Merge Intervals": 56,
  "Find All Numbers Disappeared in an Array": 448,
  "Maximum Product Subarray": 152,
  "Jump Game II": 45,
  "House Robber II": 213,
  "Longest Common Subsequence": 1143,
  "Decode Ways": 91
};

async function main() {
  await mongoose.connect(process.env.DB_CONNECT_STRING);
  let updated = 0;
  for (const [title, num] of Object.entries(NUMBER_MAP)) {
    const res = await Problem.updateOne({ title }, { problemNumber: num });
    if (res.modifiedCount > 0) updated++;
  }
  console.log(`✅ Added problem numbers to ${updated} problems`);
  process.exit(0);
}
main();