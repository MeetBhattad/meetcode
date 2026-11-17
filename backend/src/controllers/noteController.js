const ProblemNote = require('../models/problemNote');

const getNote = async (req, res) => {
  try {
    const note = await ProblemNote.findOne({
      userId: req.result._id,
      problemId: req.params.problemId,
    }).lean();
    res.status(200).json({ content: note?.content || '' });
  } catch (err) {
    console.error('getNote error:', err);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
};

const upsertNote = async (req, res) => {
  try {
    const { content } = req.body;
    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Content must be a string' });
    }
    const note = await ProblemNote.findOneAndUpdate(
      { userId: req.result._id, problemId: req.params.problemId },
      { content },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ content: note.content, updatedAt: note.updatedAt });
  } catch (err) {
    console.error('upsertNote error:', err);
    res.status(500).json({ error: 'Failed to save note' });
  }
};

module.exports = { getNote, upsertNote };