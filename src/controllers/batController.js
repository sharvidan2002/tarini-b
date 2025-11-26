const BATResponse = require('../models/BATResponse');

// Calculate BAT scores
const calculateScores = (responses) => {
  // Exhaustion (items 1-8)
  const exhaustionScore = responses.slice(0, 8).reduce((a, b) => a + b, 0) / 8;

  // Mental Distance (items 9-13)
  const mentalDistanceScore = responses.slice(8, 13).reduce((a, b) => a + b, 0) / 5;

  // Cognitive Impairment (items 14-18)
  const cognitiveImpairmentScore = responses.slice(13, 18).reduce((a, b) => a + b, 0) / 5;

  // Emotional Impairment (items 19-23)
  const emotionalImpairmentScore = responses.slice(18, 23).reduce((a, b) => a + b, 0) / 5;

  // Total BAT Score (first 23 items only)
  const totalBATScore = responses.slice(0, 23).reduce((a, b) => a + b, 0) / 23;

  // Psychological Complaints (items 24-28)
  const psychologicalComplaintsScore =
    responses.slice(23, 28).reduce((a, b) => a + b, 0) / 5;

  // Psychosomatic Complaints (items 29-33)
  const psychosomaticComplaintsScore =
    responses.slice(28, 33).reduce((a, b) => a + b, 0) / 5;

  // Combined Secondary Score
  const combinedSecondaryScore = responses.slice(23, 33).reduce((a, b) => a + b, 0) / 10;

  // Determine risk level based on Flemish BAT-23 cutoffs for Total-core
  let riskLevel;
  if (totalBATScore >= 1.00 && totalBATScore <= 2.58) {
    riskLevel = 'green'; // No risk
  } else if (totalBATScore >= 2.59 && totalBATScore <= 3.01) {
    riskLevel = 'orange'; // At risk
  } else if (totalBATScore >= 3.02 && totalBATScore <= 5.00) {
    riskLevel = 'red'; // Very high risk
  } else {
    // Default to green if somehow out of range
    riskLevel = 'green';
  }

  // Get risk level for each dimension
  const exhaustionRisk = getExhaustionRisk(exhaustionScore);
  const mentalDistanceRisk = getMentalDistanceRisk(mentalDistanceScore);
  const cognitiveRisk = getCognitiveRisk(cognitiveImpairmentScore);
  const emotionalRisk = getEmotionalRisk(emotionalImpairmentScore);
  const secondaryRisk = getSecondaryRisk(combinedSecondaryScore);

  return {
    exhaustionScore,
    mentalDistanceScore,
    cognitiveImpairmentScore,
    emotionalImpairmentScore,
    totalBATScore,
    psychologicalComplaintsScore,
    psychosomaticComplaintsScore,
    combinedSecondaryScore,
    riskLevel,
    exhaustionRisk,
    mentalDistanceRisk,
    cognitiveRisk,
    emotionalRisk,
    secondaryRisk,
  };
};

// Helper functions to determine risk level for each dimension based on Flemish cutoffs
const getExhaustionRisk = (score) => {
  if (score >= 1.00 && score <= 3.05) return 'green';
  if (score >= 3.06 && score <= 3.30) return 'orange';
  if (score >= 3.31 && score <= 5.00) return 'red';
  return 'green';
};

const getMentalDistanceRisk = (score) => {
  if (score >= 1.00 && score <= 2.49) return 'green';
  if (score >= 2.50 && score <= 3.09) return 'orange';
  if (score >= 3.10 && score <= 5.00) return 'red';
  return 'green';
};

const getCognitiveRisk = (score) => {
  if (score >= 1.00 && score <= 2.69) return 'green';
  if (score >= 2.70 && score <= 3.09) return 'orange';
  if (score >= 3.10 && score <= 5.00) return 'red';
  return 'green';
};

const getEmotionalRisk = (score) => {
  if (score >= 1.00 && score <= 2.09) return 'green';
  if (score >= 2.10 && score <= 2.89) return 'orange';
  if (score >= 2.90 && score <= 5.00) return 'red';
  return 'green';
};

const getSecondaryRisk = (score) => {
  if (score >= 1.00 && score <= 2.84) return 'green';
  if (score >= 2.85 && score <= 3.34) return 'orange';
  if (score >= 3.35 && score <= 5.00) return 'red';
  return 'green';
};

// Submit BAT assessment
exports.submitAssessment = async (req, res) => {
  try {
    const { responses } = req.body;

    // Validate responses
    if (!responses || responses.length !== 33) {
      return res.status(400).json({ message: 'Invalid responses. Must provide 33 answers.' });
    }

    // Validate each response is between 1-5
    const allValid = responses.every((r) => r >= 1 && r <= 5);
    if (!allValid) {
      return res.status(400).json({ message: 'All responses must be between 1 and 5.' });
    }

    // Calculate scores
    const scores = calculateScores(responses);

    // Create new BAT response
    const batResponse = new BATResponse({
      userId: req.userId,
      responses,
      ...scores,
    });

    await batResponse.save();

    res.status(201).json({
      message: 'Assessment submitted successfully',
      assessment: batResponse,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit assessment', error: error.message });
  }
};

// Get latest assessment
exports.getLatestAssessment = async (req, res) => {
  try {
    const assessment = await BATResponse.findOne({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(1);

    if (!assessment) {
      return res.status(404).json({ message: 'No assessment found' });
    }

    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assessment', error: error.message });
  }
};

// Get assessment history
exports.getAssessmentHistory = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const assessments = await BATResponse.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
};

// Get trend analysis
exports.getTrendAnalysis = async (req, res) => {
  try {
    const assessments = await BATResponse.find({ userId: req.userId })
      .sort({ timestamp: 1 })
      .select('totalBATScore timestamp riskLevel');

    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trend data', error: error.message });
  }
};