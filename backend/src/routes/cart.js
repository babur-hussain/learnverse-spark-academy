const router = require('express').Router();
const { Cart, Product } = require('../models');

// GET /api/cart — get user's cart
router.get('/', async (req, res) => {
  try {
    const items = await Cart.find({ user_id: req.user.uid })
      .populate('product_id');
    
    const cartItems = items.map(item => ({
      id: item._id,
      user_id: item.user_id,
      product_id: item.product_id?._id,
      quantity: item.quantity,
      added_at: item.createdAt,
      product: item.product_id,
    }));
    
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cart — add to cart
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    
    // Check if already in cart
    let cartItem = await Cart.findOne({ user_id: req.user.uid, product_id });
    
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = new Cart({ user_id: req.user.uid, product_id, quantity });
      await cartItem.save();
    }
    
    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/cart/:id — update quantity
router.put('/:id', async (req, res) => {
  try {
    const item = await Cart.findByIdAndUpdate(
      req.params.id,
      { $set: { quantity: req.body.quantity } },
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cart/:id — remove from cart
router.delete('/:id', async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cart/clear — clear entire cart
router.delete('/clear', async (req, res) => {
  try {
    await Cart.deleteMany({ user_id: req.user.uid });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
