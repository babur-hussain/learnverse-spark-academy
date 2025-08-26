import React from 'react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using LearnVerse Spark Academy, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
          <p>LearnVerse Spark Academy is an AI-powered educational platform that provides learning resources, study materials, and academic assistance to students. Our service includes but is not limited to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Interactive learning content</li>
            <li>AI-powered tutoring and assistance</li>
            <li>Progress tracking and analytics</li>
            <li>Educational resources and materials</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
          <p>To access certain features of our service, you must create an account. You are responsible for:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and complete information</li>
            <li>Promptly updating your account information</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">4. Acceptable Use</h2>
          <p>You agree not to use the service to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Violate any applicable laws or regulations</li>
            <li>Share inappropriate or harmful content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use automated scripts or bots without permission</li>
            <li>Interfere with other users' use of the service</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">5. Intellectual Property</h2>
          <p>The service and its original content, features, and functionality are and will remain the exclusive property of LearnVerse Spark Academy and its licensors. The service is protected by copyright, trademark, and other laws.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">6. User-Generated Content</h2>
          <p>You retain ownership of content you submit to our service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content in connection with the service.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">7. Privacy</h2>
          <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">8. Termination</h2>
          <p>We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever including but not limited to a breach of the Terms.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">9. Disclaimer</h2>
          <p>The information on this service is provided on an "as is" basis. To the fullest extent permitted by law, this company excludes all representations, warranties, conditions and other terms which might otherwise be implied by statute, common law, or the law of equity.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">10. Limitation of Liability</h2>
          <p>In no event shall LearnVerse Spark Academy, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">11. Changes to Terms</h2>
          <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">12. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p className="mt-2">
            Email: legal@learnverse.com<br />
            Address: [Your Company Address]
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
