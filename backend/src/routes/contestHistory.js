const express = require('express');
const router = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { saveContestResult, getContestHistory, getContestById } = require('../controllers/contestHistory');

router.post('/save', userMiddleware, saveContestResult);
router.get('/history', userMiddleware, getContestHistory);
router.get('/history/:id', userMiddleware, getContestById);

module.exports = router;