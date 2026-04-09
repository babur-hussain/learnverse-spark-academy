const router = require('express').Router();
const { Wishlist } = require('../models');

// GET /api/wishlist
router.get('/', async (req, res) => {
  try {
    const items = await Wishlist.find({ user_id: req.user.uid })
      .populate('product_id');
    
    const wishlistItems = items.map(item => ({
      id: item._id,
      user_id: item.user_id,
      product_id: item.product_id?._id,
      added_at: item.createdAt,
      product: item.product_id,
    }));
    
    res.json(wishlistItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/wishlist
router.post('/', async (req, res) => {
  try {
    const { product_id } = req.body;
    const existing = await Wishlist.findOne({ user_id: req.user.uid, product_id });
    if (existing) return res.json(existing);
    
    const item = new Wishlist({ user_id: req.user.uid, product_id });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/wishlist/:product_id
router.delete('/:product_id', async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ user_id: req.user.uid, product_id: req.params.product_id });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
