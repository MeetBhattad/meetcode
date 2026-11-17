const mongoose = require('mongoose');
const { Schema } = mongoose;

const contestResultSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  topic: { type: String, default: 'random' },
  timeLimit: { type: Number, required: true },
  totalTime: { type: Number, required: true },
  problems: [{
    problemId: { type: Schema.Types.ObjectId, ref: 'problem' },
    title: String,
    difficulty: String,
    solved: Boolean,
    timeSpent: Number,
  }],
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  solvedCount: { type: Number, default: 0 },
}, { timestamps: true });

contestResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('contestResult', contestResultSchema);