const express = require('express');
const mockRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { startSession, sendMessage, getActiveSession, endSession } = require('../controllers/mockInterview');

mockRouter.post('/start', userMiddleware, startSession);
mockRouter.post('/message', userMiddleware, sendMessage);
mockRouter.get('/active/:problemId', userMiddleware, getActiveSession);
mockRouter.post('/end', userMiddleware, endSession);

module.exports = mockRouter;