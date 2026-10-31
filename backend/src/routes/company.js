const express = require('express');
const companyRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { listCompanies, problemsByCompany } = require('../controllers/company');

companyRouter.get('/list', userMiddleware, listCompanies);
companyRouter.get('/:name/problems', userMiddleware, problemsByCompany);

module.exports = companyRouter;