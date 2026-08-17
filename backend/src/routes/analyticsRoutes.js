const express = require('express');
const ctrl = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/overview', ctrl.getOverview);
router.get('/breakdown', ctrl.getBreakdown);
router.get('/performance', ctrl.getPerformance);
router.get('/heatmap', ctrl.getHeatmap);

module.exports = router;
