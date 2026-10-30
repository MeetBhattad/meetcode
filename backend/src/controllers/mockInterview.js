const MockSession = require('../models/mockSession');
const Problem = require('../models/problem');
const OpenAI = require('openai');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
const END_MARKER = '[END_INTERVIEW]';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────
// Conciseness — regular turns = 1 question; farewell = short sentence
// ─────────────────────────────────────────────────────────────
const forceConciseness = (raw, isFarewell = false) => {
  if (!raw) return '';
  let text = raw.trim().replace(/^[*#>\s]+/gm, '').replace(/\n+/g, ' ').trim();

  if (!isFarewell) {
    const qIdx = text.indexOf('?');
    if (qIdx !== -1 && qIdx < 280) text = text.slice(0, qIdx + 1);
  }

  const words = text.split(/\s+/);
  const cap = isFarewell ? 30 : 50;
  if (words.length > cap) text = words.slice(0, cap).join(' ') + '…';

  return text.trim();
};

// ─────────────────────────────────────────────────────────────
// Interviewer prompt — now includes end-of-interview rules
// ─────────────────────────────────────────────────────────────
const buildSystemPrompt = (problem, language, code) => {
  const codePresent = code && code.trim().length > 60;
  const codeBlock = codePresent
    ? `\n\n## CANDIDATE'S CURRENT CODE (live snapshot):\n\`\`\`${language}\n${code}\n\`\`\``
    : `\n\n## CANDIDATE HAS NOT WRITTEN CODE YET (only boilerplate, if any).`;

  return `
You are a Senior Software Engineer at Meta conducting a live technical interview. The candidate is solving "${problem.title}" in ${language}.

## PROBLEM
Difficulty: ${problem.difficulty}
Description: ${problem.description}
Examples: ${JSON.stringify(problem.visibleTestCases)}${codeBlock}

## THE INTERVIEW HAS SIX STAGES. Guide the candidate through them in order.
1. **APPROACH** — Get them to describe their initial idea (usually brute force).
2. **OPTIMIZATION** — Once they've described brute force, ask if they can do better. If they name a technique, ask why it helps.
3. **COMPLEXITY** — For the final approach, get them to state time AND space complexity explicitly.
4. **CODING** — Once they've stated both complexities, say "Go ahead and code it up." Do NOT ask for code before this stage.
5. **CODE REVIEW** — AFTER they say "done" or "finished", read the code above and ask ONE specific question about it. Pick something real from their code, not a generic question.
6. **WRAP UP** — Ask them to walk through one example manually. Then ask about edge cases. Then ask "Anything you'd change?"

## HOW TO END THE INTERVIEW (CRITICAL)
You may ONLY end the interview in TWO situations:
- **(A) The candidate explicitly asks to end it** — e.g. "I'm done", "Can we wrap up?", "Let's end here", "That's all I've got".
- **(B) You have completed all six stages AND have nothing more to ask** — this means you've heard the approach, the complexity, seen the code, walked through an example, and asked about edge cases.

If EITHER condition is met:
1. Say a brief farewell in one sentence (e.g. "Alright, thanks for your time today." or "Good work — that's all from me.")
2. Append the exact marker ${END_MARKER} at the very end of your reply, on the same line.
3. Do NOT ask another question in the farewell turn.

NEVER output ${END_MARKER} unless condition A or B is met. Never end early just because the candidate seems tired or silent — encourage one more question. Never output the marker mid-sentence.

## CRITICAL RULES (breaking these is failure)
- Reply is ONE sentence, ending in a question mark (EXCEPT on the farewell turn).
- Ask ONE question per turn. Never two.
- NEVER write code. NEVER reveal the solution. If asked, refuse and ask where they're stuck.
- NEVER say "great", "good", "excellent", "nice", "perfect". Neutral tone only.
- NEVER summarize what they just said. Move forward.
- When they've coded, ALWAYS reference their actual code — not generic advice.
- If the conversation stalls, ask something specific about their approach, not "what's your next step?"

## FULL CONVERSATION EXAMPLE (imitate this flow)
Interviewer: "Alright. Walk me through your initial approach before writing any code."
Candidate: "I'd use two nested loops to check every pair."
Interviewer: "What time complexity does that give you?"
Candidate: "O(n squared)."
Interviewer: "Can you think of a way to bring that down to O(n)?"
Candidate: "Hash map to store complements."
Interviewer: "Why does a hash map let you check the complement in constant time?"
Candidate: "Because lookup is O(1) on average."
Interviewer: "And what extra space does that require?"
Candidate: "O(n) for the map."
Interviewer: "Go ahead and code it up."
Candidate: "Done."
Interviewer: "Looking at your loop — what happens if the array has duplicate values?"
Candidate: "It still works because I check before inserting."
Interviewer: "Walk me through the first example line by line."
Candidate: "For [2, 7, 11], target 9..."
Interviewer: "What about an empty array?"
Candidate: "Returns None."
Interviewer: "Any edge case you'd still want to test?"
Candidate: "Single element array."
Interviewer: "Anything you'd change about your solution?"
Candidate: "Not really."
Interviewer: "Alright, thanks for your time today. ${END_MARKER}"

## SECOND ENDING EXAMPLE (candidate asks to stop)
Candidate: "I think I'm done, can we wrap up?"
Interviewer: "Sure — thanks for walking me through your approach. ${END_MARKER}"

## ANTI-PATTERNS (never do these)
- ❌ Repeating "What's your next step?" across turns.
- ❌ Outputting ${END_MARKER} without a farewell sentence.
- ❌ Outputting ${END_MARKER} because the candidate went quiet.
- ❌ Ending the interview before the code review stage unless the candidate explicitly asks.
- ❌ Asking about edge cases BEFORE the candidate has written code.

## OUTPUT
Plain text. One sentence. Ends with "?" (or a farewell + marker on the final turn). Reference their actual code when relevant.
`;
};

// ─────────────────────────────────────────────────────────────
// LLM call — returns { text, endRequested }
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
          temperature: 0.5,
          max_tokens: 140,
        });
        const raw = completion.choices?.[0]?.message?.content?.trim();
        if (!raw || raw.length < 5) continue;

        const endRequested = raw.includes(END_MARKER);
        const cleaned = raw.replace(new RegExp(END_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '').trim();
        const text = forceConciseness(cleaned, endRequested);
        if (text) return { text, endRequested };
      } catch (err) {
        lastErr = err;
        console.error(`[mock] ${model} attempt ${attempt + 1}:`, err.message?.slice(0, 100));
        if (err.status === 429 || err.status === 503) await sleep(2000);
      }
    }
  }
  throw lastErr || new Error('All models failed');
};

// ─────────────────────────────────────────────────────────────
// Report generation — shared by sendMessage and endSession
// ─────────────────────────────────────────────────────────────
const buildReportPrompt = (problem, transcript) => `
Generate a technical interview scorecard.

Problem: ${problem.title} (${problem.difficulty})
Transcript:
${transcript}

Rate the candidate. Return ONLY valid JSON matching this exact schema:
{
  "verdict": "strong_hire" | "hire" | "borderline" | "no_hire",
  "overallScore": number (1-10),
  "scores": {
    "communication": number (1-10),
    "problemSolving": number (1-10),
    "codeQuality": number (1-10),
    "complexityAwareness": number (1-10),
    "edgeCases": number (1-10)
  },
  "strengths": [string, string, string],
  "improvements": [string, string, string],
  "summary": "2-3 sentences of honest overall assessment."
}

Rules:
- Be honest, not polite. A candidate who never coded scores low on codeQuality.
- If the transcript is very short (< 4 messages), verdict must be "borderline" or "no_hire".
- Output raw JSON only. No markdown fences.
`;

const generateReport = async (session, problem) => {
  const transcript = session.messages
    .map(m => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.text}`)
    .join('\n');

  const fallback = {
    verdict: 'borderline',
    overallScore: 5,
    scores: { communication: 5, problemSolving: 5, codeQuality: 5, complexityAwareness: 5, edgeCases: 5 },
    strengths: ['Engaged with the problem', 'Made an attempt at a solution', 'Stayed through the session'],
    improvements: [
      'Practice explaining approach out loud before coding',
      'Always state time AND space complexity',
      'Walk through examples manually after coding',
    ],
    summary: 'Interview completed. Report generated without LLM analysis due to backend error.',
  };

  try {
    const completion = await groq.chat.completions.create({
      model: MODELS[0],
      messages: [{ role: 'user', content: buildReportPrompt(problem, transcript) }],
      temperature: 0.3,
      max_tokens: 700,
      response_format: { type: 'json_object' },
    });
    const raw = completion.choices?.[0]?.message?.content?.trim() || '';
    const parsed = JSON.parse(raw);
    if (parsed && parsed.scores && parsed.verdict) return parsed;
    return fallback;
  } catch (e) {
    console.error('[mock] report generation failed:', e.message);
    return fallback;
  }
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
        language: existing.language,
        startedAt: existing.startedAt,
        resumed: true,
      });
    }

    const session = await MockSession.create({
      userId, problemId,
      language: language || 'python',
      messages: [], status: 'in-progress',
    });

    const openingText = `Alright, let's get started. Before you write any code, walk me through your initial approach for ${problem.title}.`;
    session.messages.push({ role: 'interviewer', text: openingText });
    await session.save();

    res.status(201).json({
      sessionId: session._id,
      messages: session.messages,
      language: session.language,
      startedAt: session.startedAt,
      resumed: false,
    });
  } catch (err) {
    console.error('startSession error:', err);
    res.status(500).json({ error: 'Failed to start session' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /mock/active/:problemId
// ─────────────────────────────────────────────────────────────
const getActiveSession = async (req, res) => {
  try {
    const userId = req.result._id;
    const { problemId } = req.params;

    const session = await MockSession.findOne({
      userId, problemId, status: 'in-progress',
    }).sort({ startedAt: -1 });

    if (!session) return res.status(200).json({ active: false });

    res.status(200).json({
      active: true,
      sessionId: session._id,
      messages: session.messages,
      language: session.language,
      startedAt: session.startedAt,
    });
  } catch (err) {
    console.error('getActiveSession error:', err);
    res.status(500).json({ error: 'Failed' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /mock/message — handles AI-initiated end
// ─────────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const userId = req.result._id;
    const { sessionId, text, code } = req.body;

    if (!sessionId || !text?.trim()) {
      return res.status(400).json({ error: 'sessionId and text required' });
    }

    const session = await MockSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'in-progress') {
      return res.status(400).json({ error: 'Session already ended' });
    }

    session.messages.push({ role: 'user', text: text.trim() });
    if (code && code.trim().length > 60) {
      session.codeSnapshots.push({ code: code.trim(), language: session.language });
    }
    await session.save();

    const problem = await Problem.findById(session.problemId);
    if (!problem) return res.status(404).json({ error: 'Problem no longer exists' });

    const systemPrompt = buildSystemPrompt(problem, session.language, code);

    let replyText = '';
    let endRequested = false;
    try {
      const result = await callInterviewer(systemPrompt, session.messages);
      replyText = result.text;
      endRequested = result.endRequested;
    } catch (llmErr) {
      console.error('[mock] LLM failed:', llmErr.message);
      const lastUser = session.messages.filter(m => m.role === 'user').pop()?.text || '';
      if (/done|finish|complete|wrap up|end/i.test(lastUser)) {
        replyText = 'Alright, thanks for your time today.';
        endRequested = true;
      } else if (/o\(|complexity|time|space/i.test(lastUser)) {
        replyText = 'Can you walk me through the actual implementation now?';
      } else {
        replyText = 'How would your approach handle an empty input?';
      }
    }

    session.messages.push({ role: 'interviewer', text: replyText });
    await session.save();

    // If AI ended the interview, generate report
    if (endRequested) {
      const report = await generateReport(session, problem);
      session.status = 'completed';
      session.report = report;
      session.endedAt = new Date();
      await session.save();

      return res.status(200).json({
        reply: replyText,
        messages: session.messages,
        sessionEnded: true,
        report,
      });
    }

    res.status(200).json({
      reply: replyText,
      messages: session.messages,
      sessionEnded: false,
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /mock/end — user-initiated end (unchanged logic, shared helper)
// ─────────────────────────────────────────────────────────────
const endSession = async (req, res) => {
  try {
    const userId = req.result._id;
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    const session = await MockSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (session.status === 'completed' && session.report) {
      return res.status(200).json({ report: session.report, alreadyEnded: true });
    }

    const problem = await Problem.findById(session.problemId);
    if (!problem) return res.status(404).json({ error: 'Problem missing' });

    const report = await generateReport(session, problem);

    session.status = 'completed';
    session.report = report;
    session.endedAt = new Date();
    await session.save();

    res.status(200).json({ report, alreadyEnded: false });
  } catch (err) {
    console.error('endSession error:', err);
    res.status(500).json({ error: 'Failed to end session' });
  }
};

module.exports = { startSession, sendMessage, getActiveSession, endSession };