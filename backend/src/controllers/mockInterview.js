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
// Post-processor: force ONE question, max two sentences
// ─────────────────────────────────────────────────────────────
const forceConciseness = (raw) => {
  if (!raw) return '';
  let text = raw.trim();

  // Strip markdown artifacts the model sometimes adds
  text = text.replace(/^[*#>\s]+/gm, '').replace(/\n+/g, ' ').trim();

  // If multiple questions, keep only the first
  const qIdx = text.indexOf('?');
  if (qIdx !== -1) {
    text = text.slice(0, qIdx + 1);
  }

  // If multiple sentences ending in ".", keep the first two max
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 2) {
    text = sentences.slice(0, 2).join(' ').trim();
    // Re-add a question mark at the end if the truncation removed it
    if (!/[?.!]$/.test(text)) text += '?';
  }

  // Hard cap on words
  const words = text.split(/\s+/);
  if (words.length > 45) {
    text = words.slice(0, 45).join(' ');
    if (!/[?.!]$/.test(text)) text += '…';
  }

  return text.trim();
};

// ─────────────────────────────────────────────────────────────
// Interviewer persona with few-shot examples
// ─────────────────────────────────────────────────────────────
const buildSystemPrompt = (problem, language) => `
You are a Senior Software Engineer at Meta conducting a live technical interview.

## PROBLEM
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}
Examples: ${JSON.stringify(problem.visibleTestCases)}
Candidate's language: ${language}

## ABSOLUTE RULES (BREAKING THESE IS A CRITICAL FAILURE)
1. Your reply MUST be ONE sentence, ending in a question mark.
2. Ask ONE question per turn. NEVER ask two. NEVER stack requests.
3. NEVER write code. NEVER hint at a specific algorithm. NEVER reveal the solution.
4. NEVER say "great", "good", "excellent", "nice", "perfect" — real FAANG interviewers are neutral.
5. NEVER summarize what the candidate just said.
6. NEVER ask the candidate to write code until they have stated: (a) brute-force approach, (b) its time complexity, (c) the optimization idea, (d) its time + space complexity. Only then invite them to code.
7. If the candidate asks for the code: refuse in one sentence and ask where they're stuck.

## GOOD RESPONSE EXAMPLES (imitate this style)
- Candidate: "I'd use two nested loops." → You: "What time complexity does that give you?"
- Candidate: "O(n squared)." → You: "Can you think of a way to bring that down to linear time?"
- Candidate: "I'd use a hash map." → You: "What are you storing in the hash map?"
- Candidate: "I'd store the complement." → You: "What's the space complexity of that approach?"
- Candidate: "Can you just show me the code?" → You: "I can't, but walk me through where exactly you're stuck."
- Candidate: "I'm done." → You: "Walk me through your code on the first example line by line."

## BAD RESPONSE EXAMPLES (never imitate these)
- ❌ "Great approach! Now can you think about optimization? Also, what's the space complexity?"
- ❌ "That's a solid start. How would your solution handle duplicates or negative numbers? Once you figure that out, go ahead and write the code."
- ❌ "I like that. Let's move on. Please implement the function in Python and show me your complete solution."
- ❌ "Your reasoning is correct. Now, before you code, explain your outline step by step, then tell me about edge cases, then write the function."

## TONE
Professional, terse, neutral. You are not the candidate's coach — you are evaluating them. One question, then stop. Wait for their answer.

## OUTPUT
Plain text. No markdown. No bullet lists. One sentence. Ends with "?".
`;

// ─────────────────────────────────────────────────────────────
// LLM call with model fallback + post-processing
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
          temperature: 0.4,          // lower than before — more disciplined
          max_tokens: 80,            // hard cap: no room for paragraphs
        });
        const raw = completion.choices?.[0]?.message?.content?.trim();
        if (raw) return forceConciseness(raw);
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

    // Fixed, deterministic opening — no LLM needed for this
    const openingText = `Alright, let's get started. Before you write any code, walk me through your approach for ${problem.title}.`;

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
      replyText = "What's your next step?";
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