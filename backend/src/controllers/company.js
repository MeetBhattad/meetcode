const Problem = require('../models/problem');
const User = require('../models/user');

// ── GET /company/list ───────────────────────────────────────
const listCompanies = async (req, res) => {
  try {
    const companies = await Problem.aggregate([
      { $unwind: '$companies' },
      { $match: { 'companies.timeframe': 'all' } },
      { $group: { _id: '$companies.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
    ]);
    res.status(200).json(companies);
  } catch (err) {
    console.error('listCompanies error:', err);
    res.status(500).json({ error: 'Failed to list companies' });
  }
};

// ── GET /company/:name/problems ─────────────────────────────
const problemsByCompany = async (req, res) => {
  try {
    const userId = req.result._id;
    const { name } = req.params;
    const { timeframe = 'all' } = req.query;

    const user = await User.findById(userId);
    const solvedSet = new Set((user.problemSolved || []).map((id) => id.toString()));

    const problems = await Problem.aggregate([
      { $unwind: '$companies' },
      { $match: { 'companies.name': name, 'companies.timeframe': timeframe } },
      { $sort: { 'companies.frequency': -1 } },
      {
        $project: {
          _id: 1,
          title: 1,
          difficulty: 1,
          tags: 1,
          frequency: '$companies.frequency',
          acceptanceRate: '$companies.acceptanceRate',
        },
      },
    ]);

    const enriched = problems.map((p) => ({
      ...p,
      isSolved: solvedSet.has(p._id.toString()),
    }));

    const stats = {
      total: enriched.length,
      solved: enriched.filter((p) => p.isSolved).length,
      difficulty: {
        easy: {
          total: enriched.filter((p) => p.difficulty === 'easy').length,
          solved: enriched.filter((p) => p.difficulty === 'easy' && p.isSolved).length,
        },
        medium: {
          total: enriched.filter((p) => p.difficulty === 'medium').length,
          solved: enriched.filter((p) => p.difficulty === 'medium' && p.isSolved).length,
        },
        hard: {
          total: enriched.filter((p) => p.difficulty === 'hard').length,
          solved: enriched.filter((p) => p.difficulty === 'hard' && p.isSolved).length,
        },
      },
    };

    res.status(200).json({ company: name, stats, problems: enriched });
  } catch (err) {
    console.error('problemsByCompany error:', err);
    res.status(500).json({ error: 'Failed to fetch company problems' });
  }
};

module.exports = { listCompanies, problemsByCompany };