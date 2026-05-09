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

const { sendPushNotification } = require('../utils/pushNotifications');

// POST /api/notifications/send (Admin only)
router.post('/send', async (req, res) => {
  try {
    // In a real app, verify req.user.role === 'admin'
    const { userIds, title, body, data } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    const result = await sendPushNotification(userIds, { title, body, data });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
