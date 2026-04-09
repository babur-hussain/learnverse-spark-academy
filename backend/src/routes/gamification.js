const router = require('express').Router();
const { UserXP, ActivityLog, UserBadge, Badge, UserStreak } = require('../models');

// GET /api/gamification/xp/:userId
router.get('/xp/:userId', async (req, res) => {
  try {
    let xp = await UserXP.findOne({ user_id: req.params.userId });
    if (!xp) {
      xp = new UserXP({ user_id: req.params.userId });
      await xp.save();
    }
    res.json(xp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/gamification/badges/:userId
router.get('/badges/:userId', async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ user_id: req.params.userId }).populate('badge_id');
    res.json(userBadges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/gamification/streak/:userId
router.get('/streak/:userId', async (req, res) => {
  try {
    let streak = await UserStreak.findOne({ user_id: req.params.userId });
    if (!streak) {
      streak = new UserStreak({ user_id: req.params.userId, current_streak: 0, longest_streak: 0 });
      await streak.save();
    }
    res.json(streak);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/gamification/activity/:userId
router.get('/activity/:userId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = await ActivityLog.find({ user_id: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/gamification/activity — log activity
router.post('/activity', async (req, res) => {
  try {
    const { user_id, activity_type, xp_earned, metadata } = req.body;
    
    // Create activity log
    const activity = new ActivityLog({ user_id, activity_type, xp_earned, metadata });
    await activity.save();
    
    // Update user XP
    await UserXP.findOneAndUpdate(
      { user_id },
      { 
        $inc: { total_xp: xp_earned, weekly_xp: xp_earned, monthly_xp: xp_earned },
        $setOnInsert: { user_id }
      },
      { upsert: true, new: true }
    );
    
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/gamification/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { timeframe = 'week', limit = 10 } = req.query;
    
    let sortField = 'total_xp';
    if (timeframe === 'week') sortField = 'weekly_xp';
    else if (timeframe === 'month') sortField = 'monthly_xp';
    
    const leaderboard = await UserXP.find()
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
