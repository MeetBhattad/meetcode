const Submission = require('../models/submission');
const redisClient = require('../config/redis');
const OpenAI = require('openai');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const DAILY_LIMIT = 10;

// ─────────────────────────────────────────────────────────────
// Prompt
// ─────────────────────────────────────────────────────────────
const buildReviewPrompt = (submission, problem) => `
You are a senior software engineer reviewing a candidate's ACCEPTED solution.

## PROBLEM
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}

## CANDIDATE'S ACCEPTED SOLUTION
Language: ${submission.language}
Runtime: ${submission.runtime}s
Memory: ${submission.memory} KB
Passed: ${submission.testCasesPassed}/${submission.testCasesTotal} test cases

\`\`\`${submission.language}
${submission.code}
\`\`\`

## YOUR TASK
Return ONLY valid JSON matching this exact schema. No markdown fences, no preamble.

{
  "timeComplexity": "O(...) — brief explanation of why",
  "spaceComplexity": "O(...) — brief explanation of why",
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "edgeCases": ["...", "...", "..."],
  "alternativeApproaches": ["..."],
  "interviewVerdict": "2-3 sentences of honest assessment as if you're the interviewer",
  "overallScore": 8
}

RULES:
- Be specific to THIS code — reference variable names, logic structure, patterns. NEVER generic advice.
- Time/Space complexity must be honest. Wrong complexity is worse than O(n²) admitted honestly.
- "strengths" / "improvements" / "edgeCases": exactly 3 items each.
- "alternativeApproaches": 0-2 items, only if genuinely different and better.
- "overallScore": 1-10. 10 = staff-level flawless. 7 = solid hire. 5 = borderline. Be calibrated.
`;

// ─────────────────────────────────────────────────────────────
// AI Calls
// ─────────────────────────────────────────────────────────────
const stripFences = (s) =>
  s.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

const callGroqReview = async (prompt) => {
  const completion = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',   // matches working model in mockInterview.js
    messages: [
      {
        role: 'system',
        content: 'You are a code reviewer. Return ONLY raw JSON. No markdown, no explanation, no code fences.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 1400,
    response_format: { type: 'json_object' },
  });
  let raw = completion.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty Groq response');
  raw = stripFences(raw);
  return JSON.parse(raw);
};

const callGeminiReview = async (prompt) => {
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash-lite']; // matches solveDoubt.js
  let lastErr;
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' },
      });
      let raw = response.text;
      if (!raw) throw new Error('Empty Gemini response');
      raw = stripFences(raw);
      return JSON.parse(raw);
    } catch (err) {
      lastErr = err;
      console.error(`[ai-review] Gemini ${model} failed:`, err.message?.slice(0, 150));
    }
  }
  throw lastErr || new Error('All Gemini models failed');
};

// ─────────────────────────────────────────────────────────────
// Sanitize — AI sometimes returns malformed shapes
// ─────────────────────────────────────────────────────────────
const sanitizeReview = (review) => {
  const strArr = (v) => Array.isArray(v) ? v.filter(x => typeof x === 'string' && x.trim()).slice(0, 3) : [];
  const strArrAny = (v) => Array.isArray(v) ? v.filter(x => typeof x === 'string' && x.trim()).slice(0, 2) : [];
  return {
    timeComplexity: typeof review.timeComplexity === 'string' ? review.timeComplexity : '—',
    spaceComplexity: typeof review.spaceComplexity === 'string' ? review.spaceComplexity : '—',
    strengths: strArr(review.strengths),
    improvements: strArr(review.improvements),
    edgeCases: strArr(review.edgeCases),
    alternativeApproaches: strArrAny(review.alternativeApproaches),
    interviewVerdict: typeof review.interviewVerdict === 'string' ? review.interviewVerdict : '—',
    overallScore: typeof review.overallScore === 'number'
      ? Math.max(1, Math.min(10, review.overallScore))
      : 5,
  };
};

// ─────────────────────────────────────────────────────────────
// POST /ai-review/:submissionId
// ─────────────────────────────────────────────────────────────
const aiCodeReview = async (req, res) => {
  try {
    const userId = req.result._id;
    const { submissionId } = req.params;

    const submission = await Submission.findOne({ _id: submissionId, userId })
      .populate('problemId', 'title difficulty description');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    if (submission.status !== 'accepted') {
      return res.status(400).json({ error: 'Only accepted submissions can be reviewed' });
    }
    if (!submission.problemId) {
      return res.status(400).json({ error: 'Problem no longer exists' });
    }

    // ── 1. Cache hit → return immediately (0 API calls) ──
    if (submission.aiReview) {
      return res.status(200).json({ review: submission.aiReview, cached: true });
    }

    // ── 2. Redis rate limit ──
    const todayKey = new Date().toISOString().slice(0, 10);
    const rateKey = `ai_review:${userId}:${todayKey}`;
    const count = await redisClient.incr(rateKey);
    if (count === 1) await redisClient.expire(rateKey, 86400);
    if (count > DAILY_LIMIT) {
      return res.status(429).json({
        error: `Daily AI review limit reached (${DAILY_LIMIT}/day). Try again tomorrow.`,
      });
    }

    // ── 3. Build prompt ──
    const prompt = buildReviewPrompt(submission, submission.problemId);

    // ── 4. Groq → Gemini fallback ──
    let review;
    try {
      review = await callGroqReview(prompt);
    } catch (groqErr) {
      console.error('[ai-review] Groq failed:', groqErr.message?.slice(0, 150));
      try {
        review = await callGeminiReview(prompt);
        console.log('[ai-review] Gemini fallback succeeded');
      } catch (geminiErr) {
        console.error('[ai-review] BOTH providers failed.');
        console.error('  Groq error:', groqErr.message);
        console.error('  Gemini error:', geminiErr.message);
         return res.status(503).json({
          error: `AI review failed: ${geminiErr.message?.slice(0, 100) || 'Unknown error'}`,
        });
      }
    }

    if (!review || typeof review !== 'object') {
      return res.status(502).json({ error: 'Invalid AI response' });
    }

    // ── 5. Sanitize + cache to DB ──
    const cleanReview = sanitizeReview(review);
    submission.aiReview = cleanReview;
    submission.aiReviewedAt = new Date();
    await submission.save();

    res.status(200).json({ review: cleanReview, cached: false });
  } catch (err) {
    console.error('aiCodeReview error:', err);
    res.status(500).json({ error: 'Failed to generate review' });
  }
};

module.exports = { aiCodeReview };