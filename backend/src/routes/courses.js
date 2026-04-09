const router = require('express').Router();
const { Course, Category, Subject, Chapter, Resource } = require('../models');

// GET /api/courses — list all courses with filters
router.get('/', async (req, res) => {
  try {
    const { category_id, instructor_id, is_published, is_featured, search } = req.query;
    const filter = {};
    if (category_id) filter.category_id = category_id;
    if (instructor_id) filter.instructor_id = instructor_id;
    if (is_published !== undefined) filter.is_published = is_published === 'true';
    if (is_featured !== undefined) filter.is_featured = is_featured === 'true';
    if (search) filter.title = { $regex: search, $options: 'i' };

    const courses = await Course.find(filter)
      .populate('category_id', 'name slug')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/courses/:id — get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('category_id', 'name slug');
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/courses — create course
router.post('/', async (req, res) => {
  try {
    const course = new Course({ ...req.body, instructor_id: req.user.uid });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/courses/:id — update course
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/courses/:id — delete course
router.delete('/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
