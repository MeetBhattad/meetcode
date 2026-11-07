require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Problem = require('../models/problem');

const URLS_TO_TRY = [
  'https://raw.githubusercontent.com/neenza/leetcode-problems/master/merged_problems.json',
  'https://raw.githubusercontent.com/neenza/leetcode-problems/main/merged_problems.json',
];

const TOPIC_MAP = {
  'Array': 'array', 'String': 'string', 'Hash Table': 'hashMap',
  'Two Pointers': 'twoPointers', 'Sliding Window': 'slidingWindow',
  'Stack': 'stack', 'Binary Search': 'binarySearch',
  'Linked List': 'linkedList', 'Tree': 'tree', 'Trie': 'trie',
  'Heap (Priority Queue)': 'heap', 'Backtracking': 'backtracking',
  'Graph': 'graph', 'Dynamic Programming': 'dp', 'Greedy': 'greedy',
  'Intervals': 'intervals', 'Math': 'math', 'Bit Manipulation': 'bitManipulation',
};

const LANGUAGE_MAP = { 'cpp': 'C++', 'java': 'Java', 'python3': 'Python' };

async function fetchProblems() {
  let lastErr;
  for (const url of URLS_TO_TRY) {
    try {
      console.log(`   Trying ${url}...`);
      const res = await axios.get(url, {
        timeout: 120000,
        maxContentLength: 200 * 1024 * 1024,
      });
      return res.data;
    } catch (e) {
      lastErr = e;
      console.log(`   ✗ ${e.response?.status || e.code || e.message}`);
    }
  }
  throw lastErr;
}

function normalizeToArray(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.problems)) return data.problems;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.questions)) return data.questions;
    return Object.values(data);
  }
  return null;
}

function pickField(obj, ...names) {
  for (const n of names) {
    if (obj[n] !== undefined && obj[n] !== null && obj[n] !== '') return obj[n];
  }
  return undefined;
}

async function main() {
  await mongoose.connect(process.env.DB_CONNECT_STRING);
  console.log('✅ Connected to MongoDB\n');

  console.log('📥 Fetching merged problems JSON...');
  const raw = await fetchProblems();

  // Diagnostic — shows what we actually received
  console.log('\n🔍 Response diagnostic:');
  console.log('   Type:', typeof raw);
  console.log('   Is array:', Array.isArray(raw));
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const keys = Object.keys(raw);
    console.log('   Keys count:', keys.length);
    console.log('   First 5 keys:', keys.slice(0, 5));
    const firstVal = raw[keys[0]];
    if (firstVal && typeof firstVal === 'object') {
      console.log('   Sample problem fields:', Object.keys(firstVal).slice(0, 20).join(', '));
    }
  }
  console.log();

  const problems = normalizeToArray(raw);
  if (!problems) {
    console.error('❌ Could not parse response into an array');
    process.exit(1);
  }
  console.log(`✅ Parsed ${problems.length} problems\n`);

  // Load existing problem numbers in ONE query
  console.log('📋 Loading existing problems...');
  const existingDocs = await Problem.find({}, { problemNumber: 1 }).lean();
  const existingNumbers = new Set(
    existingDocs.map((d) => d.problemNumber).filter((n) => n != null)
  );
  console.log(`   ${existingNumbers.size} problems already in DB\n`);

  const placeholderCreator = new mongoose.Types.ObjectId();
  let added = 0, skipped = 0, failed = 0;
  const failures = [];

  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];

    const problemNumber = parseInt(
      pickField(p, 'frontend_id', 'frontendId', 'questionId', 'question_id', 'id'),
      10
    );
    if (isNaN(problemNumber)) { skipped++; continue; }
    if (existingNumbers.has(problemNumber)) { skipped++; continue; }

    const title = pickField(p, 'title', 'question__title', 'questionTitle');
    if (!title) { skipped++; continue; }

    const description =
      pickField(p, 'description', 'content', 'question__content') ||
      'No description available.';
    const rawDifficulty = pickField(p, 'difficulty', 'level', 'question__difficulty') || 'easy';
    const difficulty = String(rawDifficulty).toLowerCase();
    if (!['easy', 'medium', 'hard'].includes(difficulty)) { skipped++; continue; }

    const rawTopics = pickField(p, 'topics', 'topic_tags', 'topicTags') || [];
    const mappedTags = (Array.isArray(rawTopics) ? rawTopics : [])
      .map((t) => TOPIC_MAP[t])
      .filter(Boolean);
    const tag = mappedTags[0] || 'array';

    const codeSnippets = pickField(p, 'code_snippets', 'codeSnippets') || {};
    const startCode = [];
    for (const [lcLang, ourLang] of Object.entries(LANGUAGE_MAP)) {
      if (codeSnippets[lcLang]) {
        startCode.push({ language: ourLang, initialCode: codeSnippets[lcLang] });
      }
    }
    if (startCode.length < 3) { skipped++; continue; }

    try {
      await Problem.create({
        title,
        problemNumber,
        description,
        difficulty,
        tags: tag,
        startCode,
        visibleTestCases: [],
        hiddenTestCases: [],
        referenceSolution: [],
        testHarness: [],
        companies: [],
        editorialResources: [],
        problemCreator: placeholderCreator,
      });
      existingNumbers.add(problemNumber);
      added++;
      if (added % 100 === 0) console.log(`   → ${added} imported so far...`);
    } catch (err) {
      failures.push({ title, error: err.message });
      failed++;
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log('🎉 Import complete');
  console.log(`   ✅ Added:   ${added}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed:  ${failed}`);
  if (failures.length > 0) {
    console.log('\n   First 5 failures:');
    failures.slice(0, 5).forEach((f) => console.log(`      - ${f.title}: ${f.error}`));
  }
  process.exit(0);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}