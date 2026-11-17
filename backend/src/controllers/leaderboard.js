const User = require('../models/user');
const Submission = require('../models/submission');

const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ 'problemSolved.0': { $exists: true } })
      .select('firstName lastName problemSolved')
      .lean();

    const ranked = users
      .map(u => ({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName || '',
        solvedCount: (u.problemSolved || []).length,
      }))
      .sort((a, b) => {
        if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
        return a.firstName.localeCompare(b.firstName);
      })
      .slice(0, 50);

    ranked.forEach((u, i) => { u.rank = i + 1; });

    // Current user's rank (even if outside top 50)
    let myRank = null;
    const me = ranked.find(u => u._id.toString() === req.result._id.toString());
    if (me) {
      myRank = me;
    } else {
      const meUser = await User.findById(req.result._id).select('firstName lastName problemSolved').lean();
      if (meUser && meUser.problemSolved?.length > 0) {
        const mySolved = meUser.problemSolved.length;
        const higher = users.filter(u =>
          (u.problemSolved || []).length > mySolved &&
          u._id.toString() !== req.result._id.toString()
        ).length;
        myRank = {
          _id: meUser._id,
          firstName: meUser.firstName,
          lastName: meUser.lastName || '',
          solvedCount: mySolved,
          rank: higher + 1,
        };
      }
    }

    res.status(200).json({ top: ranked, me: myRank });
  } catch (err) {
    console.error('getLeaderboard error:', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
};

module.exports = { getLeaderboard };