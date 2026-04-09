import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
          <p>LearnVerse Spark Academy collects information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>
          
          <h3 className="text-lg font-medium mt-4 mb-2">Information you provide to us:</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Account information (name, email address, password)</li>
            <li>Profile information (class, college, subjects)</li>
            <li>Learning content and progress data</li>
            <li>Communications with us</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your learning experience</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Analyze usage patterns to improve our app</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">3. Information Sharing and Disclosure</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>With service providers who assist us in operating our app</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">5. Data Retention</h2>
          <p>We retain your information for as long as your account is active or as needed to provide you services. You may delete your account at any time through the app settings.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of certain communications</li>
            <li>Request a copy of your data</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">7. Children's Privacy</h2>
          <p>Our service is intended for users 13 years and older. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">8. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "last updated" date.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">9. Contact Us</h2>
          <p>If you have any questions about this privacy policy, please contact us at:</p>
          <p className="mt-2">
            Email: privacy@learnverse.com<br />
            Address: [Your Company Address]
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
