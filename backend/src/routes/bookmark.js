const express = require('express');
const bookmarkRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getBookmarkIds, getBookmarkList, toggleBookmark } = require('../controllers/bookmarkController');

bookmarkRouter.get('/ids', userMiddleware, getBookmarkIds);
bookmarkRouter.get('/list', userMiddleware, getBookmarkList);
bookmarkRouter.post('/toggle/:problemId', userMiddleware, toggleBookmark);

module.exports = bookmarkRouter;