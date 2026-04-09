const router = require('express').Router();

// POST /api/payments/create-order — create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { itemType, itemId, amount } = req.body;

    const order = await instance.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `${itemType}_${itemId}_${Date.now()}`,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payments/verify — verify payment
router.post('/verify', async (req, res) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, itemType, itemId } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Database verification mock implementation
    console.log(`[PAYMENT VERIFIED] Granted access to ${itemType} with ID ${itemId}`);
    res.json({ verified: true, paymentId: razorpay_payment_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
