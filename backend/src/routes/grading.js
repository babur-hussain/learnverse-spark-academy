const router = require('express').Router();

// POST /api/grading/auto-grade — AI auto grading
router.post('/auto-grade', async (req, res) => {
  try {
    const { submissionId, answers } = req.body;
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate Gemini API delay
    
    // Mock grading logic processing answers length
    const totalScore = answers ? answers.length * 10 : 0;
    
    res.json({
      submissionId,
      totalScore,
      maxScore: 100,
      gradedAnswers: answers || [],
      message: 'Simulated AI auto-grading complete. Provide GEMINI_API_KEY for real generative text grading.',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/grading/batch-grade
router.post('/batch-grade', async (req, res) => {
  try {
    const { testId, submissionIds } = req.body;
    res.json({
      testId,
      gradedCount: 0,
      results: [],
      message: 'Batch grading pending implementation',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/grading/manual/:submissionId
router.post('/manual/:submissionId', async (req, res) => {
  try {
    res.json({ submissionId: req.params.submissionId, ...req.body, status: 'graded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/grading/results/:testId
router.get('/results/:testId', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
