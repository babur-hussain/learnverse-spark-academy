require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { verifyFirebaseToken } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const testRoutes = require('./routes/tests');
const forumRoutes = require('./routes/forum');
const gamificationRoutes = require('./routes/gamification');
const storageRoutes = require('./routes/storage');
const liveSessionRoutes = require('./routes/liveSessions');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const productRoutes = require('./routes/products');
const guardianRoutes = require('./routes/guardian');
const careerRoutes = require('./routes/career');
const learningRoutes = require('./routes/learning');
const analyticsRoutes = require('./routes/analytics');
const aiChatRoutes = require('./routes/aiChat');
const doubtRoutes = require('./routes/doubts');
const gradingRoutes = require('./routes/grading');
const schoolRoutes = require('./routes/schools');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyFirebaseToken, userRoutes);
app.use('/api/courses', verifyFirebaseToken, courseRoutes);
app.use('/api/tests', verifyFirebaseToken, testRoutes);
app.use('/api/forum', verifyFirebaseToken, forumRoutes);
app.use('/api/gamification', verifyFirebaseToken, gamificationRoutes);
app.use('/api/storage', verifyFirebaseToken, storageRoutes);
app.use('/api/live-sessions', verifyFirebaseToken, liveSessionRoutes);
app.use('/api/payments', verifyFirebaseToken, paymentRoutes);
app.use('/api/notifications', verifyFirebaseToken, notificationRoutes);
app.use('/api/cart', verifyFirebaseToken, cartRoutes);
app.use('/api/wishlist', verifyFirebaseToken, wishlistRoutes);
app.use('/api/products', productRoutes); // Products can be public
app.use('/api/guardian', verifyFirebaseToken, guardianRoutes);
app.use('/api/career', verifyFirebaseToken, careerRoutes);
app.use('/api/learning', verifyFirebaseToken, learningRoutes);
app.use('/api/analytics', verifyFirebaseToken, analyticsRoutes);
app.use('/api/ai-chat', verifyFirebaseToken, aiChatRoutes);
app.use('/api/doubts', verifyFirebaseToken, doubtRoutes);
app.use('/api/grading', verifyFirebaseToken, gradingRoutes);
app.use('/api/schools', schoolRoutes); // Schools can be public
app.use('/api/admin', verifyFirebaseToken, adminRoutes); // Generic admin CRUD

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Connect to MongoDB & Start Server ─────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnverse';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
