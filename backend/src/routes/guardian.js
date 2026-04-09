const router = require('express').Router();
const { User, Guardian, GuardianStudentLink } = require('../models');

// GET /api/guardian/profile
router.get('/profile', async (req, res) => {
  try {
    let guardian = await Guardian.findOne({ user_id: req.user.uid });
    if (!guardian) {
      guardian = await Guardian.create({ user_id: req.user.uid });
    }
    const user = await User.findOne({ uid: req.user.uid });
    res.json({ ...guardian.toObject(), email: user?.email, name: user?.full_name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/guardian/students
router.get('/students', async (req, res) => {
  try {
    const guardian = await Guardian.findOne({ user_id: req.user.uid });
    if (!guardian) return res.json([]);
    
    const links = await GuardianStudentLink.find({ guardian_id: guardian._id }).populate('student_id', 'full_name email avatar_url');
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/guardian/link-student
router.post('/link-student', async (req, res) => {
  try {
    res.status(201).json({ linked: true, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/guardian/alerts/:studentId
router.get('/alerts/:studentId', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/guardian/alerts/:alertId/read
router.put('/alerts/:alertId/read', async (req, res) => {
  try {
    res.json({ read: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/guardian/performance/:studentId
router.get('/performance/:studentId', async (req, res) => {
  try {
    res.json({ 
      student_id: req.params.studentId,
      attendance: { total: 0, attended: 0 },
      tests: { total: 0, completed: 0, averageScore: 0 },
      engagement: { loginStreak: 0, activeDays: 0 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/guardian/settings/:studentId
router.get('/settings/:studentId', async (req, res) => {
  try {
    res.json({ notifications: true, weeklyReport: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/guardian/settings/:studentId
router.put('/settings/:studentId', async (req, res) => {
  try {
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
