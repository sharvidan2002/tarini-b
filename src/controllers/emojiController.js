const EmojiRating = require('../models/EmojiRating');

// Submit emoji rating
exports.submitRating = async (req, res) => {
  try {
    const { level, emoji, label, stressCategory } = req.body;

    // Validate input
    if (!level || !emoji || !label || !stressCategory) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (level < 1 || level > 10) {
      return res.status(400).json({ message: 'Level must be between 1 and 10' });
    }

    // Create new rating
    const rating = new EmojiRating({
      userId: req.userId,
      level,
      emoji,
      label,
      stressCategory,
    });

    await rating.save();

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit rating', error: error.message });
  }
};

// Get today's rating
exports.getTodayRating = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const rating = await EmojiRating.findOne({
      userId: req.userId,
      timestamp: { $gte: today, $lt: tomorrow },
    }).sort({ timestamp: -1 });

    if (!rating) {
      return res.status(404).json({ message: 'No rating found for today' });
    }

    res.json(rating);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rating', error: error.message });
  }
};

// Get rating history
exports.getRatingHistory = async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;

    let startDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const ratings = await EmojiRating.find({
      userId: req.userId,
      timestamp: { $gte: startDate },
    }).sort({ timestamp: -1 });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
};

// Get stress statistics
exports.getStressStatistics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const ratings = await EmojiRating.find({
      userId: req.userId,
      timestamp: { $gte: startDate },
    });

    // Calculate statistics
    const statistics = {
      totalRatings: ratings.length,
      lowStress: ratings.filter((r) => r.stressCategory === 'low').length,
      averageStress: ratings.filter((r) => r.stressCategory === 'average').length,
      highStress: ratings.filter((r) => r.stressCategory === 'high').length,
      averageLevel:
        ratings.reduce((sum, r) => sum + r.level, 0) / ratings.length || 0,
    };

    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};