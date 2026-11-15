const Problem = require('../models/problem');

function isRunnable(p) {
  return (
    Array.isArray(p.testHarness) && p.testHarness.length >= 3 &&
    Array.isArray(p.visibleTestCases) && p.visibleTestCases.length > 0
  );
}

const getRandomProblems = async (difficulty, count, topic) => {
  const matchStage = { difficulty };
  if (topic && topic !== 'random') {
    matchStage.tags = topic;
  }
  // Oversample generously — some will be non-runnable, filtered below
  const candidates = await Problem.aggregate([
    { $match: matchStage },
    { $sample: { size: 100 } },
  ]);
  const runnable = candidates.filter(isRunnable);
  return runnable.slice(0, count);
};

const generateContest = async (req, res) => {
  try {
    const { topic } = req.query;

    const [easy, medium, hard] = await Promise.all([
      getRandomProblems('easy', 1, topic),
      getRandomProblems('medium', 2, topic),
      getRandomProblems('hard', 1, topic),
    ]);

    if (easy.length < 1 || medium.length < 2 || hard.length < 1) {
      const missing = [];
      if (easy.length < 1) missing.push('Easy');
      if (medium.length < 2) missing.push('Medium (need 2)');
      if (hard.length < 1) missing.push('Hard');
      return res.status(400).json({
        error: `Topic "${topic}" doesn't have enough ${missing.join(' + ')} problems. Try "Random" or another topic.`,
      });
    }

    const contestProblems = [...easy, ...medium, ...hard].sort(() => Math.random() - 0.5);
    const problems = contestProblems.map(p => ({
      _id: p._id,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
    }));

    res.status(200).json({ problems, timeLimitMins: 90 });
  } catch (err) {
    console.error('generateContest error:', err);
    res.status(500).json({ error: 'Failed to generate contest' });
  }
};

module.exports = { generateContest };