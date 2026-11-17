const express = require('express');
const router = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getLeaderboard } = require('../controllers/leaderboard');

router.get('/top', userMiddleware, getLeaderboard);

module.exports = router;