const router = require('express').Router();
const { DeviceToken, Notification } = require('../models');

// POST /api/notifications/register-device
router.post('/register-device', async (req, res) => {
  try {
    const { user_id, token, platform, enabled } = req.body;
    
    await DeviceToken.findOneAndUpdate(
      { user_id, platform },
      { $set: { token, enabled } },
      { upsert: true, new: true }
    );
    
    res.json({ message: 'Device registered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notifications — get user notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.uid }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { is_read: true }, { new: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
