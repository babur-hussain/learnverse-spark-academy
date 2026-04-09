const router = require('express').Router();
const { Test, Question, TestSubmission, TestAnswer } = require('../models');

// GET /api/tests — list tests with filters
router.get('/', async (req, res) => {
  try {
    const { type, created_by, is_published } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (created_by) filter.created_by = created_by;
    if (is_published !== undefined) filter.is_published = is_published === 'true';

    const tests = await Test.find(filter).sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tests/:id — get single test
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tests — create test
router.post('/', async (req, res) => {
  try {
    const test = new Test({ ...req.body, created_by: req.user.uid });
    await test.save();
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tests/:id — update test
router.put('/:id', async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tests/:id — delete test
router.delete('/:id', async (req, res) => {
  try {
    await Question.deleteMany({ test_id: req.params.id });
    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test and questions deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Questions ───────────────────────────────────────────────────────────────

// GET /api/tests/:testId/questions
router.get('/:testId/questions', async (req, res) => {
  try {
    const questions = await Question.find({ test_id: req.params.testId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tests/questions
router.post('/questions', async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tests/questions/:id
router.put('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tests/questions/:id
router.delete('/questions/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Submissions ─────────────────────────────────────────────────────────────

// POST /api/tests/submissions
router.post('/submissions', async (req, res) => {
  try {
    const submission = new TestSubmission({
      test_id: req.body.test_id,
      user_id: req.user.uid,
      start_time: new Date()
    });
    await submission.save();
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tests/submissions/:id/answers
router.post('/submissions/:id/answers', async (req, res) => {
  try {
    const { answers } = req.body;
    const answerDocs = answers.map((a) => ({
      ...a,
      submission_id: req.params.id
    }));
    await TestAnswer.insertMany(answerDocs);

    // Calculate score basic mock logic
    const score = answers.filter(a => a.is_correct).length;
    await TestSubmission.findByIdAndUpdate(req.params.id, { status: 'completed', score, end_time: new Date() });

    res.json({ submission_id: req.params.id, message: 'Answers submitted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tests/submissions/:id
router.get('/submissions/:id', async (req, res) => {
  try {
    const submission = await TestSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Not found' });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tests/:testId/submissions
router.get('/:testId/submissions', async (req, res) => {
  try {
    const submissions = await TestSubmission.find({ test_id: req.params.testId }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tests/submissions/:id/answers
router.get('/submissions/:id/answers', async (req, res) => {
  try {
    const answers = await TestAnswer.find({ submission_id: req.params.id });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tests/performance/:studentId
router.get('/performance/:studentId', async (req, res) => {
  try {
    const submissions = await TestSubmission.find({ user_id: req.params.studentId });
    const completed = submissions.filter(s => s.status === 'completed' || s.status === 'graded');
    const avgScore = completed.length > 0 
      ? completed.reduce((sum, s) => sum + s.score, 0) / completed.length 
      : 0;

    res.json({ 
      totalTests: submissions.length, 
      completedTests: completed.length, 
      averageScore: avgScore 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
