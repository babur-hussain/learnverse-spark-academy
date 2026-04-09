const router = require('express').Router();

// POST /api/auth/otp — send OTP
router.post('/otp', async (req, res) => {
  try {
    const { phone } = req.body;
    console.log(`[SIMULATED SMS] Sending OTP 123456 to ${phone}`);
    res.json({ message: 'Simulated OTP sent', status: 'pending_verification' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/verify-otp — verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (otp === '123456') {
      res.json({ message: 'OTP verified successfully', verified: true });
    } else {
      res.status(400).json({ error: 'Invalid OTP code' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
