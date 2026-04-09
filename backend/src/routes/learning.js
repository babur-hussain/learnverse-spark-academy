const router = require('express').Router();
const { LearningProfile } = require('../models');

// GET /api/learning/profile
router.get('/profile', async (req, res) => {
  try {
    let profile = await LearningProfile.findOne({ user_id: req.user.uid });
    if (!profile) {
      profile = await LearningProfile.create({ user_id: req.user.uid });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/learning/current-path
router.get('/current-path', async (req, res) => {
  try {
    res.json({ path: null, resources: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/learning/diagnostic
router.post('/diagnostic', async (req, res) => {
  try {
    await LearningProfile.findOneAndUpdate(
      { user_id: req.user.uid },
      { $push: { weaknesses: req.body.weak_topics, strengths: req.body.strong_topics } },
      { upsert: true }
    );
    res.json({ message: 'Diagnostic results saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/learning/resources/:id/complete
router.put('/resources/:id/complete', async (req, res) => {
  try {
    res.json({ completed: req.body.completed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/learning/generate-path
router.post('/generate-path', async (req, res) => {
  try {
    const profile = await LearningProfile.findOne({ user_id: req.user.uid });
    if (!profile || profile.weaknesses.length === 0) {
      return res.json({ needsDiagnostic: true });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    const simulatedPath = `AI Generated Study Path focusing on: ${profile.weaknesses.join(', ')}. Provide GEMINI_API_KEY for dynamic paths.`;
    
    res.json({ path: simulatedPath, needsDiagnostic: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/learning/analytics
router.get('/analytics', async (req, res) => {
  try {
    res.json(null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
