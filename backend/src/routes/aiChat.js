const router = require('express').Router();
const { AIChatSession, AIChatMessage } = require('../models');

// GET /api/ai-chat/history
router.get('/history', async (req, res) => {
  try {
    const sessions = await AIChatSession.find({ user_id: req.user.uid }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai-chat/sessions
router.post('/sessions', async (req, res) => {
  try {
    const session = new AIChatSession({ ...req.body, user_id: req.user.uid });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai-chat/sessions/:id/messages
router.post('/sessions/:id/messages', async (req, res) => {
  try {
    const message = new AIChatMessage({
      session_id: req.params.id,
      ...req.body
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ai-chat/sessions/:id/messages
router.get('/sessions/:id/messages', async (req, res) => {
  try {
    const messages = await AIChatMessage.find({ session_id: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai-chat/ask — send question to AI
router.post('/ask', async (req, res) => {
  try {
    const { message, session_id } = req.body;
    
    // Simulate Gemini API processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResponse = `This is a simulated AI response to your message: "${message}". Please provide GEMINI_API_KEY to enable real AI.`;
    
    if (session_id) {
      await AIChatMessage.create([
        { session_id, role: 'user', content: message },
        { session_id, role: 'assistant', content: mockResponse }
      ]);
    }
    
    res.json({ response: mockResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
