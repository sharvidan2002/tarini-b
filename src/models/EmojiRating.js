const mongoose = require('mongoose');

const emojiRatingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  emoji: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  stressCategory: {
    type: String,
    enum: ['low', 'average', 'high'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
emojiRatingSchema.index({ userId: 1, timestamp: -1 });

// Index for daily queries
emojiRatingSchema.index({ 
  userId: 1, 
  timestamp: 1 
});

module.exports = mongoose.model('EmojiRating', emojiRatingSchema);