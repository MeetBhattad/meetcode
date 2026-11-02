const express = require('express');
const pathRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { listPaths, getPath } = require('../controllers/learningPath');

pathRouter.get('/', userMiddleware, listPaths);
pathRouter.get('/:slug', userMiddleware, getPath);

module.exports = pathRouter;