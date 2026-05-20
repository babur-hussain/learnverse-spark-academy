const router = require('express').Router();

// ─── Privacy Policy ────────────────────────────────────────────────────────────
router.get('/privacy', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy — Padhaai Wala</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FFFAF5; color: #1a1a2e; line-height: 1.7; padding: 24px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; color: #FF6B35; margin-bottom: 8px; }
    h2 { font-size: 20px; color: #1a1a2e; margin: 28px 0 12px; }
    p, li { font-size: 15px; color: #475569; margin-bottom: 12px; }
    ul { padding-left: 20px; }
    .meta { font-size: 13px; color: #94a3b8; margin-bottom: 32px; }
    .logo { font-size: 14px; font-weight: 700; color: #FF6B35; letter-spacing: 1px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="logo">PADHAAI WALA</div>
  <h1>Privacy Policy</h1>
  <p class="meta">Last updated: May 21, 2026</p>

  <h2>1. Information We Collect</h2>
  <p>When you use Padhaai Wala, we may collect the following information:</p>
  <ul>
    <li><strong>Account Information:</strong> Name, email address, and profile picture when you create an account.</li>
    <li><strong>Learning Data:</strong> Course progress, quiz scores, and study preferences to personalize your experience.</li>
    <li><strong>Device Information:</strong> Device type, operating system version, and app version for troubleshooting.</li>
    <li><strong>Usage Data:</strong> Pages visited, features used, and time spent to improve our services.</li>
  </ul>

  <h2>2. How We Use Your Information</h2>
  <ul>
    <li>To provide and maintain our educational services.</li>
    <li>To personalize your learning experience and recommend relevant content.</li>
    <li>To communicate with you about updates, support, and promotions (with your consent).</li>
    <li>To analyze usage patterns and improve app performance.</li>
    <li>To ensure security and prevent fraud.</li>
  </ul>

  <h2>3. Data Sharing</h2>
  <p>We do not sell your personal data. We may share information only in these cases:</p>
  <ul>
    <li>With service providers who assist us in operating the app (e.g., cloud hosting, analytics).</li>
    <li>When required by law or to protect our legal rights.</li>
    <li>With your explicit consent.</li>
  </ul>

  <h2>4. Data Security</h2>
  <p>We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your data.</p>

  <h2>5. Data Retention & Deletion</h2>
  <p>We retain your data for as long as your account is active. You can delete your account at any time from the Settings page in the app, which will permanently remove all your personal data from our systems within 30 days.</p>

  <h2>6. Children's Privacy</h2>
  <p>Our Kids Zone features are designed with COPPA compliance in mind. We do not knowingly collect personal information from children under 13 without parental consent. If you believe a child has provided us with personal data, please contact us immediately.</p>

  <h2>7. Your Rights</h2>
  <p>You have the right to:</p>
  <ul>
    <li>Access and download your personal data.</li>
    <li>Correct inaccurate information.</li>
    <li>Delete your account and all associated data.</li>
    <li>Opt out of marketing communications.</li>
  </ul>

  <h2>8. Third-Party Services</h2>
  <p>Our app uses third-party services including Firebase (authentication & storage), MongoDB (database), and AI services for the career guidance and chat features. Each of these services has their own privacy policies.</p>

  <h2>9. Changes to This Policy</h2>
  <p>We may update this Privacy Policy from time to time. We will notify you of any material changes through the app or via email.</p>

  <h2>10. Contact Us</h2>
  <p>If you have any questions about this Privacy Policy, please contact us at:</p>
  <p><strong>Email:</strong> support@padhaaiwala.com</p>
  <p><strong>Location:</strong> New Delhi, India</p>
</body>
</html>`);
});

// ─── Terms of Service ──────────────────────────────────────────────────────────
router.get('/terms', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service — Padhaai Wala</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FFFAF5; color: #1a1a2e; line-height: 1.7; padding: 24px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; color: #FF6B35; margin-bottom: 8px; }
    h2 { font-size: 20px; color: #1a1a2e; margin: 28px 0 12px; }
    p, li { font-size: 15px; color: #475569; margin-bottom: 12px; }
    ul { padding-left: 20px; }
    .meta { font-size: 13px; color: #94a3b8; margin-bottom: 32px; }
    .logo { font-size: 14px; font-weight: 700; color: #FF6B35; letter-spacing: 1px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="logo">PADHAAI WALA</div>
  <h1>Terms of Service</h1>
  <p class="meta">Last updated: May 21, 2026</p>

  <h2>1. Acceptance of Terms</h2>
  <p>By downloading, installing, or using the Padhaai Wala mobile application ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, please do not use the App.</p>

  <h2>2. Description of Service</h2>
  <p>Padhaai Wala is an educational platform that provides online courses, study materials, career guidance, discussion forums, and other learning tools for students.</p>

  <h2>3. User Accounts</h2>
  <ul>
    <li>You must provide accurate information when creating an account.</li>
    <li>You are responsible for maintaining the security of your account credentials.</li>
    <li>You must be at least 13 years old to create an account without parental consent.</li>
    <li>We reserve the right to suspend accounts that violate these Terms.</li>
  </ul>

  <h2>4. User Conduct</h2>
  <p>You agree not to:</p>
  <ul>
    <li>Post offensive, harmful, or misleading content in the discussion forum.</li>
    <li>Harass, bully, or threaten other users.</li>
    <li>Share copyrighted material without authorization.</li>
    <li>Attempt to reverse-engineer or tamper with the App.</li>
    <li>Use the App for any illegal purpose.</li>
  </ul>

  <h2>5. Content & Intellectual Property</h2>
  <p>All course materials, designs, and content within the App are the intellectual property of Padhaai Wala or its content providers. You may not reproduce, distribute, or commercially exploit any content without written permission.</p>

  <h2>6. User-Generated Content</h2>
  <p>By posting content in discussion forums or other areas of the App, you grant us a non-exclusive license to display and distribute that content within the App. You retain ownership of your content. We reserve the right to remove content that violates our community guidelines.</p>

  <h2>7. Subscriptions & Payments</h2>
  <ul>
    <li>Some features require a paid subscription.</li>
    <li>Subscription fees are charged according to the plan selected.</li>
    <li>Refund requests are handled on a case-by-case basis.</li>
  </ul>

  <h2>8. Limitation of Liability</h2>
  <p>Padhaai Wala is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the App, including but not limited to loss of data, academic outcomes, or career decisions made based on our guidance features.</p>

  <h2>9. Termination</h2>
  <p>We may terminate or suspend your access to the App at any time for violation of these Terms. You may delete your account at any time through the Settings page.</p>

  <h2>10. Changes to Terms</h2>
  <p>We reserve the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the new Terms.</p>

  <h2>11. Governing Law</h2>
  <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>

  <h2>12. Contact</h2>
  <p>For questions about these Terms, contact us at: <strong>support@padhaaiwala.com</strong></p>
</body>
</html>`);
});

// ─── Open-Source Licenses ──────────────────────────────────────────────────────
router.get('/licenses', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Open Source Licenses — Padhaai Wala</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FFFAF5; color: #1a1a2e; line-height: 1.7; padding: 24px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; color: #FF6B35; margin-bottom: 8px; }
    h2 { font-size: 20px; color: #1a1a2e; margin: 28px 0 12px; }
    p, li { font-size: 15px; color: #475569; margin-bottom: 12px; }
    .meta { font-size: 13px; color: #94a3b8; margin-bottom: 32px; }
    .logo { font-size: 14px; font-weight: 700; color: #FF6B35; letter-spacing: 1px; margin-bottom: 4px; }
    .lib { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
    .lib-name { font-weight: 700; color: #1a1a2e; font-size: 15px; }
    .lib-license { font-size: 13px; color: #94a3b8; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="logo">PADHAAI WALA</div>
  <h1>Open Source Licenses</h1>
  <p class="meta">This app is built with the following open source libraries:</p>

  <div class="lib"><div class="lib-name">React Native</div><div class="lib-license">MIT License — Meta Platforms, Inc.</div></div>
  <div class="lib"><div class="lib-name">Expo</div><div class="lib-license">MIT License — Expo Project</div></div>
  <div class="lib"><div class="lib-name">Firebase JS SDK</div><div class="lib-license">Apache License 2.0 — Google LLC</div></div>
  <div class="lib"><div class="lib-name">Axios</div><div class="lib-license">MIT License</div></div>
  <div class="lib"><div class="lib-name">React Navigation</div><div class="lib-license">MIT License</div></div>
  <div class="lib"><div class="lib-name">Expo Router</div><div class="lib-license">MIT License — Expo Project</div></div>
  <div class="lib"><div class="lib-name">Expo Linear Gradient</div><div class="lib-license">MIT License — Expo Project</div></div>
  <div class="lib"><div class="lib-name">Ionicons</div><div class="lib-license">MIT License</div></div>
  <div class="lib"><div class="lib-name">Lottie React Native</div><div class="lib-license">Apache License 2.0 — Airbnb</div></div>
  <div class="lib"><div class="lib-name">AsyncStorage</div><div class="lib-license">MIT License</div></div>
  <div class="lib"><div class="lib-name">Express.js</div><div class="lib-license">MIT License</div></div>
  <div class="lib"><div class="lib-name">Mongoose</div><div class="lib-license">MIT License</div></div>

  <p style="margin-top: 32px; font-size: 13px; color: #94a3b8;">Full license texts are available in the respective package repositories on GitHub.</p>
</body>
</html>`);
});

module.exports = router;
