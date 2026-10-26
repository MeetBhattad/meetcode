const MockSession = require('../models/mockSession');
const Problem = require('../models/problem');
const OpenAI = require('openai');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────
// Interviewer persona — this is the heart of the feature
// ─────────────────────────────────────────────────────────────
const buildSystemPrompt = (problem, language) => `
You are a Senior Software Engineer at Meta conducting a live technical interview. You are interviewing a candidate on the problem below. The candidate will write code in ${language}.

## PROBLEM CONTEXT
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}
Examples: ${JSON.stringify(problem.visibleTestCases)}

## YOUR ROLE
You are the INTERVIEWER. You are evaluating the candidate on:
1. Problem understanding (do they ask clarifying questions?)
2. Approach articulation (can they explain before coding?)
3. Coding skill (clean, correct code)
4. Complexity awareness (time AND space)
5. Edge case handling (empty input, duplicates, negatives)

## CRITICAL RULES
1. NEVER write code for the candidate. NEVER reveal the solution. If they ask for the answer, decline and offer a hint instead.
2. Keep responses SHORT — 1-3 sentences. You're talking, not lecturing.
3. Ask ONE question at a time. Never stack multiple questions.
4. Probe based on what they actually say. If they say "I'll use a hash map," ask "why a hash map over a sorted array?" If they say "O(n)", ask "what about space complexity?"
5. Push back on weak reasoning. If they claim something wrong, say "Are you sure about that?" — don't just accept it.
6. If they're stuck or silent, offer a small nudge — not the answer.
7. Do NOT say "Great job!", "Excellent!", "Nice!" — real FAANG interviewers are neutral. Say "Okay" or "Let's continue."
8. Do NOT summarize what they said back to them. Move forward.
9. Never break character. Never mention you are an AI. Never say "as an AI."

## FLOW
- Opening: Ask them to explain their approach BEFORE coding. Mention brute force first, then ask about optimization.
- Middle: React to what they say. Probe edge cases, complexity, alternative approaches. If they go quiet, ask "What are you thinking?"
- If they finish coding: Ask them to walk through a small example manually. Ask about edge cases.
- If they seem done: Ask "Are you confident in this solution? Is there anything you'd change?"

## TONE
Professional, neutral, probing — like a real FAANG interviewer. Terse. Not warm, not cold. Never sycophantic.

## OUTPUT FORMAT
Plain conversational text. No markdown headers. No bullet lists. 1-3 sentences max.
`;

// ─────────────────────────────────────────────────────────────
// LLM call with model fallback + retry
// ─────────────────────────────────────────────────────────────
const callInterviewer = async (systemPrompt, conversationMessages) => {
  const mapped = conversationMessages.map(m => ({
    role: m.role === 'interviewer' ? 'assistant' : 'user',
    content: m.text,
  }));

  let lastErr = null;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          messages: [{ role: 'system', content: systemPrompt }, ...mapped],
          temperature: 0.7,
          max_tokens: 200,
        });
        const text = completion.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      } catch (err) {
        lastErr = err;
        if (err.status === 429 || err.status === 503) await sleep(3000);
      }
    }
  }
  throw lastErr || new Error('All models failed');
};

// ─────────────────────────────────────────────────────────────
// POST /mock/start
// ─────────────────────────────────────────────────────────────
const startSession = async (req, res) => {
  try {
    const userId = req.result._id;
    const { problemId, language } = req.body;
    if (!problemId) return res.status(400).json({ error: 'problemId required' });

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Resume existing in-progress session for the same problem
    const existing = await MockSession.findOne({
      userId, problemId, status: 'in-progress',
    }).sort({ startedAt: -1 });

    if (existing) {
      return res.status(200).json({
        sessionId: existing._id,
        messages: existing.messages,
        resumed: true,
      });
    }

    const session = await MockSession.create({
      userId,
      problemId,
      language: language || 'python',
      messages: [],
      status: 'in-progress',
    });

    const systemPrompt = buildSystemPrompt(problem, session.language);

    let openingText;
    try {
      openingText = await callInterviewer(systemPrompt, [
        { role: 'user', text: 'Begin the interview with your opening question.' },
      ]);
    } catch {
      openingText = "Let's get started. Take a look at the problem. Before you write any code, walk me through your initial approach.";
    }

    session.messages.push({ role: 'interviewer', text: openingText });
    await session.save();

    res.status(201).json({
      sessionId: session._id,
      messages: session.messages,
      resumed: false,
    });
  } catch (err) {
    console.error('startSession error:', err);
    res.status(500).json({ error: 'Failed to start session' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /mock/message
// ─────────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const userId = req.result._id;
    const { sessionId, text } = req.body;

    if (!sessionId || !text?.trim()) {
      return res.status(400).json({ error: 'sessionId and text required' });
    }

    const session = await MockSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'in-progress') {
      return res.status(400).json({ error: 'Session already ended' });
    }

    session.messages.push({ role: 'user', text: text.trim() });
    await session.save();

    const problem = await Problem.findById(session.problemId);
    if (!problem) return res.status(404).json({ error: 'Problem no longer exists' });

    const systemPrompt = buildSystemPrompt(problem, session.language);

    let replyText;
    try {
      replyText = await callInterviewer(systemPrompt, session.messages);
    } catch {
      replyText = "Let's continue. What's your next step?";
    }

    session.messages.push({ role: 'interviewer', text: replyText });
    await session.save();

    res.status(200).json({
      reply: replyText,
      messages: session.messages,
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

module.exports = { startSession, sendMessage };