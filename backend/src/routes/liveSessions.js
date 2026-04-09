const router = require('express').Router();
const { LiveSession } = require('../models');

// GET /api/live-sessions — get all sessions grouped by status
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    
    const [upcoming, active, past] = await Promise.all([
      LiveSession.find({ scheduled_start_time: { $gt: now }, status: 'scheduled' })
        .sort({ scheduled_start_time: 1 }),
      LiveSession.find({ is_active: true, status: 'live' })
        .sort({ actual_start_time: -1 }),
      LiveSession.find({ status: 'ended', recorded_url: { $ne: null } })
        .sort({ actual_end_time: -1 }),
    ]);
    
    res.json({ upcoming, active, past });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/live-sessions/upcoming
router.get('/upcoming', async (req, res) => {
  try {
    const sessions = await LiveSession.find({
      scheduled_start_time: { $gte: new Date() },
    }).sort({ scheduled_start_time: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/live-sessions/active
router.get('/active', async (req, res) => {
  try {
    const sessions = await LiveSession.find({ is_active: true });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/live-sessions/recordings
router.get('/recordings', async (req, res) => {
  try {
    const sessions = await LiveSession.find({ recorded_url: { $ne: null } })
      .sort({ scheduled_start_time: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/live-sessions/:id
router.get('/:id', async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/live-sessions — create session
router.post('/', async (req, res) => {
  try {
    const session = new LiveSession({ ...req.body, instructor_id: req.user.uid });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/live-sessions/:id
router.put('/:id', async (req, res) => {
  try {
    const session = await LiveSession.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { new: true }
    );
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/live-sessions/:id/start
router.post('/:id/start', async (req, res) => {
  try {
    const session = await LiveSession.findByIdAndUpdate(
      req.params.id,
      { $set: { is_active: true, status: 'live', actual_start_time: new Date(), stream_url: req.body.stream_url } },
      { new: true }
    );
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/live-sessions/:id/end
router.post('/:id/end', async (req, res) => {
  try {
    const session = await LiveSession.findByIdAndUpdate(
      req.params.id,
      { $set: { is_active: false, status: 'ended', actual_end_time: new Date(), recorded_url: req.body.recorded_url } },
      { new: true }
    );
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/live-sessions/:id/interactions
router.get('/:id/interactions', async (req, res) => {
  try {
    // TODO: Create interaction models (questions, chat, polls, etc.)
    res.json({ questions: [], chatMessages: [], handRaises: [], reactions: [], polls: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/live-sessions/:id/questions
router.post('/:id/questions', async (req, res) => {
  try {
    res.status(201).json({ id: Date.now().toString(), session_id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/live-sessions/:id/chat
router.post('/:id/chat', async (req, res) => {
  try {
    res.status(201).json({ id: Date.now().toString(), session_id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/live-sessions/:id/hand-raise
router.post('/:id/hand-raise', async (req, res) => {
  try {
    res.status(201).json({ id: Date.now().toString(), session_id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/live-sessions/:id/reactions
router.post('/:id/reactions', async (req, res) => {
  try {
    res.status(201).json({ id: Date.now().toString(), session_id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/live-sessions/:id/polls
router.post('/:id/polls', async (req, res) => {
  try {
    res.status(201).json({ id: Date.now().toString(), session_id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/live-sessions/check-access
router.post('/check-access', async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    // TODO: Implement proper access control
    res.json({ access: true, isAdmin: false, isInstructor: false, accessLevel: 'free' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/live-sessions/batch-access/:batchId
router.get('/batch-access/:batchId', async (req, res) => {
  try {
    // TODO: Implement batch access
    res.json({ userId: req.user.uid, batchId: req.params.batchId, hasPurchased: false, hasSubscription: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
