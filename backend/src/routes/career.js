const router = require('express').Router();
const { CareerProfile } = require('../models');

// ─── Profile ─────────────────────────────────────────────────────────────────

router.get('/profile', async (req, res) => {
  try {
    let profile = await CareerProfile.findOne({ user_id: req.user.uid });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/profile', async (req, res) => {
  try { res.status(201).json(req.body); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/profile/:id', async (req, res) => {
  try { res.json(req.body); } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Matches ─────────────────────────────────────────────────────────────────

router.get('/matches', async (req, res) => {
  try { res.json([]); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/matches', async (req, res) => {
  try { res.status(201).json(req.body); } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Roadmap ─────────────────────────────────────────────────────────────────

router.get('/roadmap/:matchId', async (req, res) => {
  try { res.json(null); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/roadmap', async (req, res) => {
  try { res.status(201).json(req.body); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/milestone/:id', async (req, res) => {
  try { res.json({ completed: req.body.completed }); } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Recommendations ─────────────────────────────────────────────────────────

router.get('/recommendations/:roadmapId', async (req, res) => {
  try { res.json(null); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/recommendations', async (req, res) => {
  try { res.status(201).json(req.body); } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Progress ────────────────────────────────────────────────────────────────

router.get('/progress/:roadmapId', async (req, res) => {
  try { res.json(null); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/progress', async (req, res) => {
  try { res.status(201).json(req.body); } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Chat History ────────────────────────────────────────────────────────────

router.get('/chat-history', async (req, res) => {
  try { res.json([]); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/chat', async (req, res) => {
  try { res.status(201).json(req.body); } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── AI Endpoints ────────────────────────────────────────────────────────────

router.post('/ai/analyze-aptitude', async (req, res) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI delay
    res.json({ analysis: 'Based on your aptitude tests, you have strong logic and reasoning skills perfectly suited for Engineering and Computer Science. Provide GEMINI_API_KEY for real dynamic analysis.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/ai/generate-matches', async (req, res) => {
  try { res.json({ matches: [] }); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/ai/generate-roadmap', async (req, res) => {
  try { res.json({ roadmap: null }); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/ai/recommend-courses', async (req, res) => {
  try { res.json({ courses: [] }); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/ai/adapt-progress', async (req, res) => {
  try { res.json({ adaptations: [] }); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/ai/chat', async (req, res) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    res.json({ response: 'I am your simulated AI career counselor. In the future you will need to provide a GEMINI_API_KEY to ask me real questions.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
