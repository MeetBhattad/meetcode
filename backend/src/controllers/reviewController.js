const ReviewCard = require('../models/reviewCard');

// GET: Fetch problems due for review today
const getDueReviews = async (req, res) => {
  try {
    const userId = req.result._id;
    const now = new Date();

    const dueCards = await ReviewCard.find({
      userId,
      nextReviewDate: { $lte: now }
    }).populate('problemId', 'title difficulty tags problemNumber');

    res.status(200).json(dueCards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch due reviews' });
  }
};

// POST: Submit a review (Update SM-2 interval)
const submitReview = async (req, res) => {
  try {
    const userId = req.result._id;
    const { problemId } = req.params;
    const { quality } = req.body; // 0 to 5. (0-2 = Failed, 3-5 = Passed)

    let card = await ReviewCard.findOne({ userId, problemId });

    if (!card) {
      // First time reviewing this problem
      card = new ReviewCard({ userId, problemId });
    }

    if (quality < 3) {
      // Failed -> Reset
      card.repetitions = 0;
      card.interval = 1;
    } else {
      // Passed -> Increase interval
      card.repetitions += 1;
      if (card.repetitions === 1) {
        card.interval = 1;
      } else if (card.repetitions === 2) {
        card.interval = 3;
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }
    }

    // Update ease factor
    card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (card.easeFactor < 1.3) card.easeFactor = 1.3;

    // Calculate next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + card.interval);
    card.nextReviewDate = nextDate;

    await card.save();
    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

module.exports = { getDueReviews, submitReview };