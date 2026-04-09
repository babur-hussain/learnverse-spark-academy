const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// In production, set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON path
// Or provide the service account key directly
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  admin.initializeApp(
    serviceAccount
      ? { credential: admin.credential.cert(serviceAccount) }
      : { credential: admin.credential.applicationDefault() }
  );
}

/**
 * Express middleware: verifies Firebase ID token from Authorization header
 */
const verifyFirebaseToken = async (req, res, next) => {
  // Allow public access to storage download-url for GET requests
  if (req.method === 'GET' && req.originalUrl.startsWith('/api/storage/download-url')) {
    return next();
  }

  // Allow public access to specific admin collections for GET requests
  if (req.method === 'GET' && req.originalUrl.startsWith('/api/admin/')) {
    const collection = req.originalUrl.split('/')[3]?.split('?')[0]; // e.g. /api/admin/courses?foo=1 -> courses
    const publicCollections = [
      'courses', 'colleges', 'classes', 'subjects',
      'course_categories', 'categories', 'chapters', 'resources',
      'featured_courses', 'featured_categories', 'goals',
      'class_subjects', 'college_subjects', 'subject_resources', 'course_resources'
    ];
    if (collection && publicCollections.includes(collection)) {
      return next();
    }
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { admin, verifyFirebaseToken };
