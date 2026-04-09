const router = require('express').Router();
const { ForumThread, ForumCategory, ForumPost } = require('../models');

// ─── Categories ──────────────────────────────────────────────────────────────

// GET /api/forum/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await ForumCategory.find().sort({ order_index: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/forum/categories/:slug
router.get('/categories/:slug', async (req, res) => {
  try {
    const category = await ForumCategory.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Threads ─────────────────────────────────────────────────────────────────

// GET /api/forum/threads
router.get('/threads', async (req, res) => {
  try {
    const { category_id, sort_by, search } = req.query;
    const filter = {};
    if (category_id) filter.category_id = category_id;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];

    let sort = { is_pinned: -1, createdAt: -1 };
    if (sort_by === 'active') sort = { is_pinned: -1, updatedAt: -1 };

    const threads = await ForumThread.find(filter).sort(sort);
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/forum/threads/:id
router.get('/threads/:id', async (req, res) => {
  try {
    const thread = await ForumThread.findByIdAndUpdate(
      req.params.id,
      { $inc: { view_count: 1 } },
      { new: true }
    );
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/forum/threads
router.post('/threads', async (req, res) => {
  try {
    const thread = new ForumThread({ ...req.body, user_id: req.user.uid });
    await thread.save();
    res.status(201).json(thread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Posts ────────────────────────────────────────────────────────────────────

// GET /api/forum/threads/:id/posts
router.get('/threads/:id/posts', async (req, res) => {
  try {
    const posts = await ForumPost.find({ thread_id: req.params.id }).sort({ createdAt: 1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/forum/threads/:id/posts
router.post('/threads/:id/posts', async (req, res) => {
  try {
    const post = new ForumPost({
      thread_id: req.params.id,
      user_id: req.user.uid,
      content: req.body.content,
      parent_id: req.body.parent_id
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Votes ───────────────────────────────────────────────────────────────────

router.post('/posts/:id/vote', async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/posts/:id/accept', async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Polls ───────────────────────────────────────────────────────────────────

router.post('/polls/:id/vote', async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Bookmarks & Subscriptions ───────────────────────────────────────────────

router.post('/threads/:id/bookmark', async (req, res) => {
  try { res.json({ bookmarked: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/threads/:id/bookmark', async (req, res) => {
  try { res.json({ bookmarked: false }); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/threads/:id/subscribe', async (req, res) => {
  try { res.json({ subscribed: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/threads/:id/subscription', async (req, res) => {
  try { res.json({ subscribed: false }); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/threads/:id/report', async (req, res) => {
  try { res.json({ reported: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/bookmarks', async (req, res) => {
  try { res.json([]); } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
