const mongoose = require('mongoose');

const batResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  responses: {
    type: [Number],
    required: true,
    validate: {
      validator: function (v) {
        return v.length === 33;
      },
      message: 'Responses array must contain exactly 33 items',
    },
  },
  // Core BAT dimensions
  exhaustionScore: {
    type: Number,
    required: true,
  },
  mentalDistanceScore: {
    type: Number,
    required: true,
  },
  cognitiveImpairmentScore: {
    type: Number,
    required: true,
  },
  emotionalImpairmentScore: {
    type: Number,
    required: true,
  },
  totalBATScore: {
    type: Number,
    required: true,
  },
  // Secondary symptoms
  psychologicalComplaintsScore: {
    type: Number,
    required: true,
  },
  psychosomaticComplaintsScore: {
    type: Number,
    required: true,
  },
  combinedSecondaryScore: {
    type: Number,
    required: true,
  },
  // Risk assessment
  riskLevel: {
    type: String,
    enum: ['green', 'orange', 'red'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
batResponseSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('BATResponse', batResponseSchema);