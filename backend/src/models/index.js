const mongoose = require('mongoose');

// Universal plugin to seamlessly transform MongoDB _id to standard Supabase 'id'
// This fixes all frontend dependencies attempting to read item.id
mongoose.plugin((schema) => {
  schema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  });
});
// ─── User ──────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true },
  full_name: String,
  avatar_url: String,
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  bio: String,
  phone: String,
  location: String,
  subjects_teaching: [String],
  specializations: [String],
  experience_years: Number,
  education: String,
  current_grade: String,
  school: String,
  interests: [String],
}, { timestamps: true });

// ─── Course ────────────────────────────────────────────────────────────────────
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  short_description: String,
  thumbnail_url: String,
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  instructor_id: { type: String, ref: 'User' },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  is_published: { type: Boolean, default: false },
  is_featured: { type: Boolean, default: false },
  tags: [String],
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  duration_hours: Number,
}, { timestamps: true });

// ─── Category ──────────────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  slug: { type: String, unique: true },
  icon: String,
  is_active: { type: Boolean, default: true },
  order_index: { type: Number, default: 0 },
}, { timestamps: true });

// ─── Class ─────────────────────────────────────────────────────────────────────
const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  order_index: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

// ─── College ───────────────────────────────────────────────────────────────────
const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  slug: { type: String, unique: true },
  city: String,
  state: String,
  type: String,
  established_year: Number,
  website: String,
  is_featured: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  order_index: { type: Number, default: 0 },
}, { timestamps: true });

// ─── Subject ───────────────────────────────────────────────────────────────────
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  college_id: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  icon_url: String,
  is_active: { type: Boolean, default: true },
  order_index: { type: Number, default: 0 },
}, { timestamps: true });

// ─── Chapter ───────────────────────────────────────────────────────────────────
const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  order_index: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

// ─── Resource ──────────────────────────────────────────────────────────────────
const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'note', 'audio', 'document'] },
  url: String,
  chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  duration: Number,
  is_free: { type: Boolean, default: false },
  order_index: { type: Number, default: 0 },
}, { timestamps: true });

// ─── Live Session ──────────────────────────────────────────────────────────────
const liveSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  instructor_id: { type: String, ref: 'User' },
  scheduled_start_time: Date,
  scheduled_end_time: Date,
  actual_start_time: Date,
  actual_end_time: Date,
  status: { type: String, enum: ['scheduled', 'live', 'ended'], default: 'scheduled' },
  stream_url: String,
  recorded_url: String,
  chat_enabled: { type: Boolean, default: true },
  is_active: { type: Boolean, default: false },
  access_level: { type: String, enum: ['free', 'paid', 'subscription'], default: 'free' },
}, { timestamps: true });

// ─── Test ──────────────────────────────────────────────────────────────────────
const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['mock', 'live'] },
  duration_minutes: Number,
  scheduled_at: Date,
  created_by: { type: String, ref: 'User' },
  level_of_strictness: { type: Number, default: 2 },
  is_published: { type: Boolean, default: false },
}, { timestamps: true });

// ─── Question ──────────────────────────────────────────────────────────────────
const questionSchema = new mongoose.Schema({
  test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  question_text: { type: String, required: true },
  options: mongoose.Schema.Types.Mixed, // JSON object for MCQs
  correct_answer: String,
  type: { type: String, enum: ['mcq', 'short', 'long'] },
  marks: { type: Number, default: 1 },
  negative_marks: { type: Number, default: 0 },
}, { timestamps: true });

// ─── Forum Thread ──────────────────────────────────────────────────────────────
const forumThreadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumCategory' },
  user_id: { type: String, ref: 'User' },
  is_pinned: { type: Boolean, default: false },
  is_locked: { type: Boolean, default: false },
  view_count: { type: Number, default: 0 },
  thread_type: { type: String, enum: ['discussion', 'question', 'poll', 'announcement'] },
  status: { type: String, enum: ['open', 'closed', 'resolved'], default: 'open' },
  tags: [String],
}, { timestamps: true });

// ─── Product ───────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  short_description: String,
  sku: String,
  brand_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' },
  price: { type: Number, required: true },
  original_price: Number,
  currency: { type: String, default: 'INR' },
  stock_quantity: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  is_featured: { type: Boolean, default: false },
  seller_id: { type: String, ref: 'User' },
  tags: [String],
  features: [String],
  images: [{ image_url: String, alt_text: String, is_primary: Boolean, order_index: Number }],
}, { timestamps: true });

// ─── Cart ──────────────────────────────────────────────────────────────────────
const cartSchema = new mongoose.Schema({
  user_id: { type: String, required: true, ref: 'User' },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
}, { timestamps: true });

// ─── Wishlist ──────────────────────────────────────────────────────────────────
const wishlistSchema = new mongoose.Schema({
  user_id: { type: String, required: true, ref: 'User' },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });

// ─── Gamification ──────────────────────────────────────────────────────────────
const userXPSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true, ref: 'User' },
  total_xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  weekly_xp: { type: Number, default: 0 },
  monthly_xp: { type: Number, default: 0 },
}, { timestamps: true });

const activityLogSchema = new mongoose.Schema({
  user_id: { type: String, required: true, ref: 'User' },
  activity_type: String,
  xp_earned: { type: Number, default: 0 },
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

// ─── Device Token ──────────────────────────────────────────────────────────────
const deviceTokenSchema = new mongoose.Schema({
  user_id: { type: String, required: true, ref: 'User' },
  token: { type: String, required: true },
  platform: { type: String, enum: ['ios', 'android', 'web'] },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

// ─── Additional Models ─────────────────────────────────────────────────────────

// ForumCategory
const forumCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  icon: String,
  is_active: { type: Boolean, default: true },
  order_index: { type: Number, default: 0 },
}, { timestamps: true });

// ForumPost
const forumPostSchema = new mongoose.Schema({
  thread_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumThread', required: true },
  user_id: { type: String, ref: 'User', required: true },
  content: { type: String, required: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost' },
  upvotes: { type: Number, default: 0 },
  is_accepted_answer: { type: Boolean, default: false },
}, { timestamps: true });

// TestSubmission
const testSubmissionSchema = new mongoose.Schema({
  test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  user_id: { type: String, ref: 'User', required: true },
  status: { type: String, enum: ['in_progress', 'completed', 'graded'], default: 'in_progress' },
  score: { type: Number, default: 0 },
  start_time: Date,
  end_time: Date,
}, { timestamps: true });

// TestAnswer
const testAnswerSchema = new mongoose.Schema({
  submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TestSubmission', required: true },
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answer_text: String,
  selected_options: [String],
  is_correct: Boolean,
  marks_awarded: { type: Number, default: 0 },
}, { timestamps: true });

// ProductCategory
const productCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  slug: { type: String, unique: true },
  icon: String,
}, { timestamps: true });

// Brand
const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  logo_url: String,
}, { timestamps: true });

// Badge
const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  icon_url: String,
  xp_required: Number,
  category: String,
}, { timestamps: true });

// UserBadge
const userBadgeSchema = new mongoose.Schema({
  user_id: { type: String, ref: 'User', required: true },
  badge_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  awarded_at: { type: Date, default: Date.now },
}, { timestamps: true });

// UserStreak
const userStreakSchema = new mongoose.Schema({
  user_id: { type: String, ref: 'User', required: true, unique: true },
  current_streak: { type: Number, default: 0 },
  longest_streak: { type: Number, default: 0 },
  last_activity_date: Date,
}, { timestamps: true });

// School
const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  city: String,
  state: String,
  contact_email: String,
  type: String,
}, { timestamps: true });

// Doubt
const doubtSchema = new mongoose.Schema({
  user_id: { type: String, ref: 'User', required: true },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['pending', 'in_progress', 'resolved'], default: 'pending' },
  answer: String,
  attachments: [String],
}, { timestamps: true });

// Guardian
const guardianSchema = new mongoose.Schema({
  user_id: { type: String, ref: 'User', required: true, unique: true },
  phone: String,
  relationship: String,
}, { timestamps: true });

// GuardianStudentLink
const guardianStudentLinkSchema = new mongoose.Schema({
  guardian_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Guardian', required: true },
  student_id: { type: String, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

// LearningProfile
const learningProfileSchema = new mongoose.Schema({
  user_id: { type: String, ref: 'User', required: true, unique: true },
  learning_style: String, // visual, auditory, reading
  pace: String,
  strengths: [String],
  weaknesses: [String],
}, { timestamps: true });

// CareerProfile
const careerProfileSchema = new mongoose.Schema({
  user_id: { type: String, ref: 'User', required: true, unique: true },
  interests: [String],
  skills: [String],
  target_roles: [String],
  target_industries: [String],
}, { timestamps: true });

// AIChatSession
const aiChatSessionSchema = new mongoose.Schema({
  user_id: { type: String, ref: 'User', required: true },
  title: String,
  context: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

// AIChatMessage
const aiChatMessageSchema = new mongoose.Schema({
  session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AIChatSession', required: true },
  role: { type: String, enum: ['user', 'assistant'] },
  content: String,
}, { timestamps: true });

// Notification
const notificationSchema = new mongoose.Schema({
  user_id: { type: String, ref: 'User', required: true },
  title: { type: String, required: true },
  body: String,
  type: String,
  is_read: { type: Boolean, default: false },
  link: String,
}, { timestamps: true });

// ─── Export Models ─────────────────────────────────────────────────────────────
module.exports = {
  User: mongoose.model('User', userSchema),
  Course: mongoose.model('Course', courseSchema),
  Category: mongoose.model('Category', categorySchema),
  Class: mongoose.model('Class', classSchema),
  College: mongoose.model('College', collegeSchema),
  Subject: mongoose.model('Subject', subjectSchema),
  Chapter: mongoose.model('Chapter', chapterSchema),
  Resource: mongoose.model('Resource', resourceSchema),
  LiveSession: mongoose.model('LiveSession', liveSessionSchema),
  Test: mongoose.model('Test', testSchema),
  Question: mongoose.model('Question', questionSchema),
  ForumThread: mongoose.model('ForumThread', forumThreadSchema),
  Product: mongoose.model('Product', productSchema),
  Cart: mongoose.model('Cart', cartSchema),
  Wishlist: mongoose.model('Wishlist', wishlistSchema),
  UserXP: mongoose.model('UserXP', userXPSchema),
  ActivityLog: mongoose.model('ActivityLog', activityLogSchema),
  DeviceToken: mongoose.model('DeviceToken', deviceTokenSchema),
  ForumCategory: mongoose.model('ForumCategory', forumCategorySchema),
  ForumPost: mongoose.model('ForumPost', forumPostSchema),
  TestSubmission: mongoose.model('TestSubmission', testSubmissionSchema),
  TestAnswer: mongoose.model('TestAnswer', testAnswerSchema),
  ProductCategory: mongoose.model('ProductCategory', productCategorySchema),
  Brand: mongoose.model('Brand', brandSchema),
  Badge: mongoose.model('Badge', badgeSchema),
  UserBadge: mongoose.model('UserBadge', userBadgeSchema),
  UserStreak: mongoose.model('UserStreak', userStreakSchema),
  School: mongoose.model('School', schoolSchema),
  Doubt: mongoose.model('Doubt', doubtSchema),
  Guardian: mongoose.model('Guardian', guardianSchema),
  GuardianStudentLink: mongoose.model('GuardianStudentLink', guardianStudentLinkSchema),
  LearningProfile: mongoose.model('LearningProfile', learningProfileSchema),
  CareerProfile: mongoose.model('CareerProfile', careerProfileSchema),
  AIChatSession: mongoose.model('AIChatSession', aiChatSessionSchema),
  AIChatMessage: mongoose.model('AIChatMessage', aiChatMessageSchema),
  Notification: mongoose.model('Notification', notificationSchema),
};
