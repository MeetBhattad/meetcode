const express = require('express');
const noteRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getNote, upsertNote } = require('../controllers/noteController');

noteRouter.get('/:problemId', userMiddleware, getNote);
noteRouter.put('/:problemId', userMiddleware, upsertNote);

module.exports = noteRouter;