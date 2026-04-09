const router = require('express').Router();
const { getPresignedUploadUrl } = require('../config/s3');
const { Doubt } = require('../models');

// GET /api/doubts — list user's doubts
router.get('/', async (req, res) => {
  try {
    const doubts = await Doubt.find({ user_id: req.user.uid }).sort({ createdAt: -1 });
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/doubts — submit a doubt
router.post('/', async (req, res) => {
  try {
    const doubt = new Doubt({
      ...req.body,
      user_id: req.user.uid,
      status: 'pending'
    });
    await doubt.save();
    res.status(201).json(doubt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/doubts/:id
router.get('/:id', async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ error: 'Doubt not found' });
    res.json(doubt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/doubts/:id/resolve
router.post('/:id/resolve', async (req, res) => {
  try {
    const doubt = await Doubt.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', answer: req.body.answer },
      { new: true }
    );
    if (!doubt) return res.status(404).json({ error: 'Doubt not found' });
    res.json(doubt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/doubts/upload — get presigned URL for attachment
router.post('/upload', async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    const result = await getPresignedUploadUrl(fileName, fileType, 'doubt-attachments');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
