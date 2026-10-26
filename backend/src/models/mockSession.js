const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  role: { type: String, enum: ['interviewer', 'user'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const codeSnapshotSchema = new Schema({
  code: { type: String, required: true },
  language: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const mockSessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'problem', required: true },
  language: { type: String, default: 'python' },
  messages: [messageSchema],
  codeSnapshots: [codeSnapshotSchema],
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress',
  },
  report: { type: Schema.Types.Mixed, default: null },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
}, { timestamps: true });

mockSessionSchema.index({ userId: 1, startedAt: -1 });
mockSessionSchema.index({ userId: 1, problemId: 1, status: 1 });

module.exports = mongoose.model('mockSession', mockSessionSchema);