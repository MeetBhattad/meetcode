const express = require('express');
const mockRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { startSession, sendMessage } = require('../controllers/mockInterview');

mockRouter.post('/start', userMiddleware, startSession);
mockRouter.post('/message', userMiddleware, sendMessage);

module.exports = mockRouter;