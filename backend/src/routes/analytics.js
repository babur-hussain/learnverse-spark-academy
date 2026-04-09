const router = require('express').Router();
const { TestSubmission } = require('../models');

// GET /api/analytics/performance/:userId
router.get('/performance/:userId', async (req, res) => {
  try {
    const submissions = await TestSubmission.find({ user_id: req.params.userId, status: { $in: ['completed', 'graded'] } });
    const totalScore = submissions.reduce((sum, sub) => sum + sub.score, 0);
    const avgScore = submissions.length ? totalScore / submissions.length : 0;
    
    res.json({
      total_tests: submissions.length,
      average_score: avgScore,
      recent_submissions: submissions.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/anomalies/:userId
router.get('/anomalies/:userId', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analytics/goals
router.post('/goals', async (req, res) => {
  try {
    res.status(201).json({ id: Date.now().toString(), ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/suggestions/:batchId
router.get('/suggestions/:batchId', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
