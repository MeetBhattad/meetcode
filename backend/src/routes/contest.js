const express = require('express');
const contestRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { generateContest } = require('../controllers/contestController');

contestRouter.get('/generate', userMiddleware, generateContest);

module.exports = contestRouter;