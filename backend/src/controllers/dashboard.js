const User = require('../models/user');
const Problem = require('../models/problem');
const Submission = require('../models/submission');
const MockSession = require('../models/mockSession');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.result._id;

    const [user, allProblems, userSubs, mockSessions] = await Promise.all([
      User.findById(userId),
      Problem.find({}).select('_id title difficulty tags'),
      Submission.find({ userId })
        .select('problemId status createdAt language')
        .sort({ createdAt: -1 }),
      MockSession.find({ userId, status: 'completed' })
        .select('report endedAt')
        .sort({ endedAt: -1 }),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const problemMap = {};
    allProblems.forEach(p => { problemMap[p._id.toString()] = p; });

    const solvedSet = new Set((user.problemSolved || []).map(id => id.toString()));
    const totalProblems = allProblems.length;

    const difficulty = {
      easy:   { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard:   { solved: 0, total: 0 },
    };
    allProblems.forEach(p => {
      if (!difficulty[p.difficulty]) return;
      difficulty[p.difficulty].total++;
      if (solvedSet.has(p._id.toString())) difficulty[p.difficulty].solved++;
    });

    const topicMap = {};
    allProblems.forEach(p => {
      if (!p.tags) return;
      if (!topicMap[p.tags]) topicMap[p.tags] = { solved: 0, total: 0, attempted: 0 };
      topicMap[p.tags].total++;
      if (solvedSet.has(p._id.toString())) topicMap[p.tags].solved++;
    });

    const attemptedProblems = new Set();
    userSubs.forEach(s => {
      const pid = s.problemId.toString();
      attemptedProblems.add(pid);
      if (!solvedSet.has(pid)) {
        const prob = problemMap[pid];
        if (prob?.tags && topicMap[prob.tags]) topicMap[prob.tags].attempted++;
      }
    });

    const topics = Object.entries(topicMap)
      .map(([tag, stats]) => ({
        tag,
        solved: stats.solved,
        total: stats.total,
        rate: stats.total > 0 ? stats.solved / stats.total : 0,
        attempted: stats.attempted,
      }))
      .sort((a, b) => b.total - a.total);

    const weakTopics = topics
      .filter(t => t.attempted > 0 && t.rate < 0.5)
      .map(t => t.tag);

    const acceptedSubs = userSubs.filter(s => s.status === 'accepted');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weeklyMap = {};
    const weekOrder = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      weeklyMap[key] = 0;
      weekOrder.push(key);
    }

    const seen = new Set();
    acceptedSubs.forEach(s => {
      const dayKey = s.createdAt.toISOString().slice(0, 10);
      const dedupeKey = `${dayKey}-${s.problemId}`;
      if (weeklyMap[dayKey] !== undefined && !seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        weeklyMap[dayKey]++;
      }
    });

    const weekly = weekOrder.map(date => ({ date, count: weeklyMap[date] }));

    const solvedDates = new Set();
    acceptedSubs.forEach(s => solvedDates.add(s.createdAt.toISOString().slice(0, 10)));

    const todayKey = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    let streak = 0;
    let startOffset = 0;
    if (solvedDates.has(todayKey)) startOffset = 0;
    else if (solvedDates.has(yesterdayKey)) startOffset = 1;
    else startOffset = -1;

    if (startOffset >= 0) {
      for (let i = startOffset; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        if (solvedDates.has(key)) streak++;
        else break;
      }
    }

    const sortedDates = Array.from(solvedDates).sort();
    let longestStreak = 0, currentRun = 0, prevDate = null;
    for (const dateStr of sortedDates) {
      const d = new Date(dateStr);
      if (prevDate) {
        const diff = Math.round((d - prevDate) / (1000 * 60 * 60 * 24));
        currentRun = diff === 1 ? currentRun + 1 : 1;
      } else {
        currentRun = 1;
      }
      longestStreak = Math.max(longestStreak, currentRun);
      prevDate = d;
    }

    const recent = userSubs.slice(0, 10).map(s => ({
      problemTitle: problemMap[s.problemId.toString()]?.title || 'Unknown',
      difficulty: problemMap[s.problemId.toString()]?.difficulty || 'unknown',
      status: s.status,
      language: s.language,
      createdAt: s.createdAt,
    }));

    const interviews = {
      total: mockSessions.length,
      avgScore: mockSessions.length > 0
        ? Math.round(
            (mockSessions.reduce((s, x) => s + (x.report?.overallScore || 0), 0) / mockSessions.length) * 10
          ) / 10
        : 0,
      lastVerdict: mockSessions[0]?.report?.verdict || null,
    };

    res.status(200).json({
      overview: {
        totalSolved: solvedSet.size,
        totalAttempted: attemptedProblems.size,
        totalProblems,
        streak,
        longestStreak,
        thisWeek: weekly.reduce((s, d) => s + d.count, 0),
      },
      difficulty,
      topics,
      weakTopics,
      weekly,
      recent,
      interviews,
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

module.exports = { getDashboardStats };