const router = require('express').Router();
const { User } = require('../models');

// POST /api/users/register — register a new user after Firebase auth
router.post('/register', async (req, res) => {
  try {
    const { uid, email, username, full_name, role } = req.body;
    
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.json(existingUser);
    }

    // Generate a fallback username to avoid unique constraint errors if missing
    const generatedUsername = username || `${email.split('@')[0]}_${Math.floor(Math.random() * 10000)}`;

    const user = new User({ 
      uid, 
      email, 
      username: generatedUsername, 
      full_name, 
      role: role || 'student' 
    });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/role — get current user's role
router.get('/role', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    res.json({ role: user?.role || 'student' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/profile — get current user's profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/profile — update current user's profile
router.put('/profile', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { $set: req.body },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/course-progress
router.get('/course-progress', async (req, res) => {
  try {
    res.json([]); // Array of course progress objects
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/study-stats
router.get('/study-stats', async (req, res) => {
  try {
    res.json({ totalStudyTimeHrs: 0, testsTaken: 0, doubtsResolved: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
