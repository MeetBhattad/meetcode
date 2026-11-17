const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemNoteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'problem', required: true },
  content: { type: String, default: '' },
}, { timestamps: true });

problemNoteSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('problemNote', problemNoteSchema);