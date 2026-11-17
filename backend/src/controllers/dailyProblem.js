const Problem = require('../models/problem');
const Submission = require('../models/submission');

// djb2 hash — deterministic, well-distributed
function hashString(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

const getDailyProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const now = new Date();
    const dateKey = now.toISOString().slice(0, 10); // UTC YYYY-MM-DD

    // Fetch runnable problems, sorted by _id for determinism
    const all = await Problem.find({})
      .select('_id title difficulty tags problemNumber testHarness visibleTestCases')
      .sort({ _id: 1 })
      .lean();

    const runnable = all.filter(p =>
      Array.isArray(p.testHarness) && p.testHarness.length >= 3 &&
      Array.isArray(p.visibleTestCases) && p.visibleTestCases.length > 0
    );

    if (runnable.length === 0) {
      return res.status(404).json({ error: 'No runnable problems available' });
    }

    // Deterministic pick — same for every user today
    const seed = hashString(dateKey);
    const daily = runnable[seed % runnable.length];

    // Start of today in UTC
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);

    const todaySubs = await Submission.find({
      userId,
      problemId: daily._id,
      createdAt: { $gte: startOfToday },
    }).select('status').lean();

    const solvedToday = todaySubs.some(s => s.status === 'accepted');
    const attemptsToday = todaySubs.length;

    res.status(200).json({
      problem: {
        _id: daily._id,
        title: daily.title,
        difficulty: daily.difficulty,
        tags: daily.tags,
        problemNumber: daily.problemNumber,
      },
      date: dateKey,
      solvedToday,
      attemptsToday,
    });
  } catch (err) {
    console.error('getDailyProblem error:', err);
    res.status(500).json({ error: 'Failed to fetch daily problem' });
  }
};

module.exports = { getDailyProblem };