const LearningPath = require('../models/learningPath');
const Problem = require('../models/problem');
const User = require('../models/user');

// ── GET /paths — list all paths with user progress ──────────
const listPaths = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId);
    const solvedSet = new Set((user.problemSolved || []).map((id) => id.toString()));

    const paths = await LearningPath.find({ isActive: true }).sort({ order: 1 });

    const result = paths.map((path) => {
      const total = path.problemIds.length;
      const solved = path.problemIds.filter((id) => solvedSet.has(id.toString())).length;

      let nextProblemId = null;
      for (const pid of path.problemIds) {
        if (!solvedSet.has(pid.toString())) {
          nextProblemId = pid;
          break;
        }
      }

      return {
        _id: path._id,
        name: path.name,
        slug: path.slug,
        description: path.description,
        type: path.type,
        total,
        solved,
        expectedTotal: path.expectedTotal || total,
        nextProblemId,
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('listPaths error:', err);
    res.status(500).json({ error: 'Failed to load paths' });
  }
};

// ── GET /paths/:slug — single path with problem list ────────
const getPath = async (req, res) => {
  try {
    const userId = req.result._id;
    const { slug } = req.params;

    const path = await LearningPath.findOne({ slug, isActive: true });
    if (!path) return res.status(404).json({ error: 'Path not found' });

    const user = await User.findById(userId);
    const solvedSet = new Set((user.problemSolved || []).map((id) => id.toString()));

    const problems = await Problem.find({ _id: { $in: path.problemIds } }).select(
      '_id title difficulty tags problemNumber'
    );

    const problemMap = {};
    problems.forEach((p) => { problemMap[p._id.toString()] = p; });

    const orderedProblems = path.problemIds
      .map((id) => problemMap[id.toString()])
      .filter(Boolean)
      .map((p) => ({
        ...p.toObject(),
        isSolved: solvedSet.has(p._id.toString()),
      }));

    const solved = orderedProblems.filter((p) => p.isSolved).length;
    const nextProblem = orderedProblems.find((p) => !p.isSolved);

    res.status(200).json({
      _id: path._id,
      name: path.name,
      slug: path.slug,
      description: path.description,
      type: path.type,
      expectedTotal: path.expectedTotal || orderedProblems.length,
      stats: { total: orderedProblems.length, solved },
      problems: orderedProblems,
      nextProblemId: nextProblem?._id || null,
    });
  } catch (err) {
    console.error('getPath error:', err);
    res.status(500).json({ error: 'Failed to load path' });
  }
};

module.exports = { listPaths, getPath };