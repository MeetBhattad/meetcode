const Problem = require('../models/problem');

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

// ── GET /company/:name/problems ──────────────────────────────
const problemsByCompany = async (req, res) => {
  try {
    const { name } = req.params;
    const { timeframe = 'all' } = req.query;

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

    res.status(200).json(problems);
  } catch (err) {
    console.error('problemsByCompany error:', err);
    res.status(500).json({ error: 'Failed to fetch company problems' });
  }
};

module.exports = { listCompanies, problemsByCompany };