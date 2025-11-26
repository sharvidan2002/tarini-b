const express = require('express');
const router = express.Router();
const emojiController = require('../controllers/emojiController');
const auth = require('../middleware/auth');

// All routes are protected
router.post('/submit', auth, emojiController.submitRating);
router.get('/today', auth, emojiController.getTodayRating);
router.get('/history', auth, emojiController.getRatingHistory);
router.get('/statistics', auth, emojiController.getStressStatistics);

module.exports = router;