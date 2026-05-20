const router = require('express').Router();

// GET /api/config/keys — return public API keys needed by the mobile app
// This keeps API keys out of the client bundle and allows rotation without app updates
router.get('/keys', (req, res) => {
  res.json({
    news_api_key: process.env.NEWS_API_KEY || 'pub_32e90a20ef294939a8cdd5173091db48',
    // Add more keys here as needed
  });
});

module.exports = router;
