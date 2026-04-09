const router = require('express').Router();
const mongoose = require('mongoose');
const { User, Course, Category, Subject, Chapter, Resource, Product, Class, College } = require('../models');

/**
 * Generic CRUD handler for admin operations.
 * The frontend calls /api/admin/<collection> endpoints from the transformed
 * Supabase query builder patterns. This router maps them to Mongoose operations.
 */

// Model registry — maps collection names to Mongoose models
const modelMap = {
  profiles: User,
  users: User,
  courses: Course,
  categories: Category,
  course_categories: Category,
  subjects: Subject,
  chapters: Chapter,
  resources: Resource,
  products: Product,
  classes: Class,
  colleges: College,
  class_subjects: Subject,
  college_subjects: Subject,
  subject_resources: Resource,
  course_resources: Resource,
};

// Helper: get model for a collection name
function getModel(collection) {
  // Direct lookup
  if (modelMap[collection]) return modelMap[collection];

  // Try to find by converting to mongoose model name
  const modelName = collection
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  try {
    return mongoose.model(modelName);
  } catch {
    return null;
  }
}

// GET /api/admin/:collection — list items with optional filters
router.get('/:collection', async (req, res) => {
  try {
    const Model = getModel(req.params.collection);
    if (!Model) {
      return res.json([]); // Return empty for unknown collections
    }

    // Build filter from query params (exclude internal params)
    const { sort_by, sort_order, order_by, sort, limit, offset, ...filterParams } = req.query;
    const filter = {};

    for (const [key, value] of Object.entries(filterParams)) {
      if (value === 'true') filter[key] = true;
      else if (value === 'false') filter[key] = false;
      else if (value === 'null') filter[key] = null;
      else if (key.endsWith('_id') && /^[0-9a-fA-F]{24}$/.test(value)) {
        filter[key] = new mongoose.Types.ObjectId(value);
      }
      else filter[key] = value;
    }

    let query = Model.find(filter);

    const sortField = sort_by || order_by;
    if (sortField) {
      const order = (sort_order || sort) === 'asc' ? 1 : -1;
      query = query.sort({ [sortField]: order });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    if (limit) query = query.limit(parseInt(limit));
    if (offset) query = query.skip(parseInt(offset));

    const items = await query;
    res.json(items);
  } catch (error) {
    console.error(`Error listing ${req.params.collection}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/:collection/:id — get single item
router.get('/:collection/:id', async (req, res) => {
  try {
    const Model = getModel(req.params.collection);
    if (!Model) return res.status(404).json({ error: 'Collection not found' });

    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/:collection — create item
router.post('/:collection', async (req, res) => {
  try {
    const Model = getModel(req.params.collection);
    if (!Model) return res.status(404).json({ error: 'Collection not found' });

    const item = new Model(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/:collection/upsert — upsert item
router.post('/:collection/upsert', async (req, res) => {
  try {
    const Model = getModel(req.params.collection);
    if (!Model) return res.status(404).json({ error: 'Collection not found' });

    const data = req.body;
    const id = data._id || data.id;

    if (id) {
      const item = await Model.findByIdAndUpdate(id, { $set: data }, { upsert: true, new: true });
      return res.json(item);
    }

    const item = new Model(data);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/:collection/:id — update item
router.put('/:collection/:id', async (req, res) => {
  try {
    const Model = getModel(req.params.collection);
    if (!Model) return res.status(404).json({ error: 'Collection not found' });

    const item = await Model.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/:collection/:id — delete item
router.delete('/:collection/:id', async (req, res) => {
  try {
    const Model = getModel(req.params.collection);
    if (!Model) return res.status(404).json({ error: 'Collection not found' });

    await Model.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
