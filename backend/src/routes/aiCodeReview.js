const express = require('express');
const aiReviewRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { aiCodeReview } = require('../controllers/aiCodeReview');

aiReviewRouter.post('/:submissionId', userMiddleware, aiCodeReview);

module.exports = aiReviewRouter;