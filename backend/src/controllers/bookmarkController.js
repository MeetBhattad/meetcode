const User = require('../models/user');

const getBookmarkIds = async (req, res) => {
  try {
    const user = await User.findById(req.result._id).select('bookmarkedProblems');
    res.status(200).json((user?.bookmarkedProblems || []).map(id => id.toString()));
  } catch (err) {
    console.error('getBookmarkIds error:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

const getBookmarkList = async (req, res) => {
  try {
    const user = await User.findById(req.result._id)
      .populate('bookmarkedProblems', 'title difficulty tags problemNumber testHarness visibleTestCases');
    const ids = (user?.bookmarkedProblems || []).filter(Boolean);
    const map = {};
    ids.forEach(p => { map[p._id.toString()] = p; });

    // Newest bookmark first
    const ordered = [...ids]
      .reverse()
      .map(p => {
        const problem = map[p._id.toString()];
        const isRunnable = Array.isArray(problem.testHarness) && problem.testHarness.length >= 3
          && Array.isArray(problem.visibleTestCases) && problem.visibleTestCases.length > 0;
        return {
          _id: problem._id,
          title: problem.title,
          difficulty: problem.difficulty,
          tags: problem.tags,
          problemNumber: problem.problemNumber,
          isRunnable,
        };
      });

    res.status(200).json(ordered);
  } catch (err) {
    console.error('getBookmarkList error:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const userId = req.result._id;
    const { problemId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ids = user.bookmarkedProblems.map(id => id.toString());
    const idx = ids.indexOf(problemId);

    if (idx > -1) {
      user.bookmarkedProblems.splice(idx, 1);
      await user.save();
      return res.status(200).json({ bookmarked: false });
    }
    user.bookmarkedProblems.push(problemId);
    await user.save();
    res.status(200).json({ bookmarked: true });
  } catch (err) {
    console.error('toggleBookmark error:', err);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
};

module.exports = { getBookmarkIds, getBookmarkList, toggleBookmark };