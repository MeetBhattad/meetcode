const ContestResult = require('../models/contestResult');

const SCORE_MAP = { easy: 3, medium: 5, hard: 8 };

const saveContestResult = async (req, res) => {
  try {
    const userId = req.result._id;
    const { topic, timeLimit, totalTime, problems } = req.body;

    if (!Array.isArray(problems) || problems.length === 0) {
      return res.status(400).json({ error: 'problems array is required' });
    }

    const score = problems.reduce((s, p) =>
      s + (p.solved ? (SCORE_MAP[p.difficulty] || 0) : 0), 0);
    const maxScore = problems.reduce((s, p) => s + (SCORE_MAP[p.difficulty] || 0), 0);
    const solvedCount = problems.filter(p => p.solved).length;

    const result = await ContestResult.create({
      userId,
      topic: topic || 'random',
      timeLimit,
      totalTime,
      problems: problems.map(p => ({
        problemId: p._id,
        title: p.title,
        difficulty: p.difficulty,
        solved: !!p.solved,
        timeSpent: p.timeSpent || 0,
      })),
      score,
      maxScore,
      solvedCount,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('saveContestResult error:', err);
    res.status(500).json({ error: 'Failed to save contest result' });
  }
};

const getContestHistory = async (req, res) => {
  try {
    const results = await ContestResult.find({ userId: req.result._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.status(200).json(results);
  } catch (err) {
    console.error('getContestHistory error:', err);
    res.status(500).json({ error: 'Failed to load contest history' });
  }
};

const getContestById = async (req, res) => {
  try {
    const result = await ContestResult.findOne({
      _id: req.params.id,
      userId: req.result._id,   // ensures only the owner can view
    }).lean();
    if (!result) return res.status(404).json({ error: 'Contest not found' });
    res.status(200).json(result);
  } catch (err) {
    console.error('getContestById error:', err);
    res.status(500).json({ error: 'Failed to fetch contest' });
  }
};

module.exports = { saveContestResult, getContestHistory, getContestById };