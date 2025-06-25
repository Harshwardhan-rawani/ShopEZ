const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const router = express.Router();

router.get('/overview', analyticsController.getOverview);
router.get('/top-products', analyticsController.getTopProducts);
router.get('/sales-by-period', analyticsController.getSalesByPeriod);

module.exports = router;
