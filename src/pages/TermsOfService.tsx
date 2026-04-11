import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';

const TermsOfService = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 tracking-tight">Terms and Conditions</h1>
        <div className="prose prose-lg dark:prose-invert max-w-none prose-h2:text-primary">
          <p className="text-sm text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-4 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            These Terms and Conditions ("Terms", "Terms of Service") govern your relationship with the LearnVerse Spark Academy website and mobile application operated by LearnVerse Spark Academy ("us", "we", or "our").
            By accessing or using the Service, you agree to be bound by these exhaustive Terms.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">1. License & Access to the Service</h2>
            <p>LearnVerse Spark Academy grants you a personal, non-exclusive, non-transferable, and revocable license to access and use the platform strictly in accordance with these Terms.</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>This license does not include any resale or commercial use of our Service or its educational contents.</li>
              <li>You may not reproduce, duplicate, copy, sell, or exploit our proprietary educational videos, notes, or quiz databases for commercial motives.</li>
              <li>Any unauthorized use automatically terminates the permission or license granted by LearnVerse Spark Academy.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">2. User Accounts & Security</h2>
            <p>When you create an account with us, you represent and warrant that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account.</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You are solely responsible for maintaining the confidentiality of your account password.</li>
              <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
              <li>You may not use as a username the name of another person or entity or that is not lawfully available for use.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">3. Premium Content, Purchases & Refunds</h2>
            <p>Some parts of the Service are billed on a subscription or one-time purchase basis (e.g., Premium PDF Notes, Masterclass Access). </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Billing:</strong> You will be billed in advance on a recurring and periodic basis depending on the type of Premium subscription plan you select.</li>
              <li><strong>Refunds:</strong> Except when required by law or distinctly specified on the checkout page, paid Academic purchases are non-refundable. If you have purchased digital downloadable content (e.g. PDFs), refunds are entirely waived the moment the download begins due to the irreversible nature of digital property.</li>
              <li><strong>Modifications:</strong> We reserve the right to modify Premium fees at any time, but will grant existing users a 30-day notice prior to the change.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">4. Intellectual Property Rights</h2>
            <p>The Service and all of its original content (excluding User Generated Content), features, educational modules, algorithms, and UI aesthetics are and will remain the exclusive, undisputed property of LearnVerse Spark Academy and its direct licensors.</p>
            <p>The Service is heavily protected by copyright, trademark, and other domestic and international intellectual property laws. Our trademarks, logos, and proprietary avatars may not be used in connection with any product or service without the prior written consent of LearnVerse.</p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">5. Academic Integrity & Acceptable Use</h2>
            <p>As an educational institution platform, adherence to academic integrity is fundamental:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You agree not to utilize our platform to plagiarize, cheat on sanctioned academic tests, or solicit others to do the same.</li>
              <li>You agree not to upload malware, discriminatory language, defamatory statements, or obscene materials to our community forums or review sections.</li>
              <li>We reserve the right to deploy AI detection mechanisms to ensure user generated content abides by community standard guidelines.</li>
            </ul>
          </section>
          
          <section className="mb-10 bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <h2 className="text-2xl font-bold mb-4 text-primary">6. Termination & Service Suspension</h2>
            <p className="m-0">
              We may instantly terminate or suspend your account, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of these specific Terms. Upon termination, your right to use the Service will immediately cease. If you wish to voluntarily terminate your account, please consult our <a href="/data-deletion-policy" className="font-semibold underline">Account Deletion Policy</a> for instructions.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
            <p>In no event shall LearnVerse Spark Academy, nor its directors, employees, partners, agents, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible academic losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; and (iii) unauthorized access, use or alteration of your specific transmissions or instructional material.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">8. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of your jurisdiction without regard to its conflict of law provisions.</p>
            <p>Our explicit failure to enforce any right or provision of these detailed Terms will not be considered a waiver of those specific rights. If any provision is held to be invalid or broadly unenforceable by a governing court, the remaining provisions will vividly remain in effect.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
            <p>If you have any detailed inquiries specifically concerning these detailed Terms and Conditions, connect with our administration instantly:</p>
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl mt-4 border border-gray-200 dark:border-gray-800">
              <p className="m-0 text-primary hover:underline"><a href="mailto:support@learnverse.lfvs.in">support@learnverse.lfvs.in</a></p>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsOfService;
