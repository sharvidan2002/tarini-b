const express = require('express');
const router = express.Router();
const batController = require('../controllers/batController');
const auth = require('../middleware/auth');

// All routes are protected
router.post('/submit', auth, batController.submitAssessment);
router.get('/latest', auth, batController.getLatestAssessment);
router.get('/history', auth, batController.getAssessmentHistory);
router.get('/trend', auth, batController.getTrendAnalysis);

module.exports = router;