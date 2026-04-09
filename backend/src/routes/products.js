const router = require('express').Router();
const { Product, ProductCategory, Brand } = require('../models');

// GET /api/products — list products (public)
router.get('/', async (req, res) => {
  try {
    const { category_id, brand_id, search, featured, seller_id } = req.query;
    const filter = { is_active: true };
    if (category_id) filter.category_id = category_id;
    if (brand_id) filter.brand_id = brand_id;
    if (seller_id) filter.seller_id = seller_id;
    if (featured === 'true') filter.is_featured = true;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter)
      .populate('brand_id', 'name logo_url')
      .populate('category_id', 'name slug')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/categories — list product categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await ProductCategory.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/brands — list brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id — get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brand_id', 'name logo_url')
      .populate('category_id', 'name slug');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products — create product
router.post('/', async (req, res) => {
  try {
    const product = new Product({ ...req.body, seller_id: req.user?.uid });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id — update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id — delete product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
