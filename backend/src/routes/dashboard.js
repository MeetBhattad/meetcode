const express = require('express');
const dashboardRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getDashboardStats } = require('../controllers/dashboard');

dashboardRouter.get('/stats', userMiddleware, getDashboardStats);

module.exports = dashboardRouter;