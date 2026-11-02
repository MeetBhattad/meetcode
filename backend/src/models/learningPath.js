const mongoose = require('mongoose');
const { Schema } = mongoose;

const learningPathSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['curated', 'topic'], default: 'curated' },
  problemIds: [{ type: Schema.Types.ObjectId, ref: 'problem' }],
  expectedTotal: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('learningPath', learningPathSchema);