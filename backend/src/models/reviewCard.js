const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewCardSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'problem', required: true },
  nextReviewDate: { type: Date, required: true },
  interval: { type: Number, default: 1 }, // in days
  easeFactor: { type: Number, default: 2.5 }, // SM-2 difficulty multiplier
  repetitions: { type: Number, default: 0 },
}, { timestamps: true });

// Ensure a user only has one card per problem
reviewCardSchema.index({ userId: 1, problemId: 1 }, { unique: true });
// Fast lookup for the "Due Today" query
reviewCardSchema.index({ userId: 1, nextReviewDate: 1 });

module.exports = mongoose.model('reviewCard', reviewCardSchema);