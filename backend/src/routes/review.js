const express = require('express');
const reviewRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getDueReviews, submitReview } = require('../controllers/reviewController');

reviewRouter.get('/due', userMiddleware, getDueReviews);
reviewRouter.post('/:problemId', userMiddleware, submitReview);

module.exports = reviewRouter;