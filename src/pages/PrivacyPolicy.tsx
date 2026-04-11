import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';

const PrivacyPolicy = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 tracking-tight">Privacy Policy</h1>
        <div className="prose prose-lg dark:prose-invert max-w-none prose-h2:text-primary">
          <p className="text-sm text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-4 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            Welcome to LearnVerse Spark Academy. We respect your privacy and are deeply committed to protecting your personal data. This comprehensive privacy policy explains how we collect, use, and safeguard your information when you visit our website or use our mobile applications.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p>We collect information that you voluntarily provide to us when registering at LearnVerse Spark Academy. This includes:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Personal Identification Data:</strong> Full name, email address, phone number, and physical address.</li>
              <li><strong>Academic Profile Data:</strong> Current school, grade level, college preferences, subject interests, and educational goals.</li>
              <li><strong>Financial Data:</strong> Transaction history and billing details (Note: We do not store full credit card numbers directly on our servers; these are safely managed by our payment processor, Stripe/Razorpay).</li>
              <li><strong>Usage Data:</strong> Information on how you interact with our educational content, your quiz scores, time spent on different modules, and IP addresses.</li>
              <li><strong>Device Data:</strong> Hardware models, operating systems, unique device identifiers, and mobile network information.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <p>Your data allows us to provide a seamless and highly personalized learning experience. We utilize your data to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Deliver adaptive learning content tailored specifically to your academic weaknesses and strengths.</li>
              <li>Facilitate account creation and authentication processes safely.</li>
              <li>Process your academic payments and deliver premium content such as paid notes or video lectures.</li>
              <li>Send administrative information, including security alerts, technical notices, and service updates.</li>
              <li>Respond effectively to your customer service requests and support needs.</li>
              <li>Generate anonymized analytics to improve our curriculum and platform algorithms.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">3. Data Sharing & Third-Party Disclosure</h2>
            <p>We deeply respect your confidentiality. We do not sell, rent, or trade your personal information. We may share your data strictly under the following limited circumstances:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Service Providers:</strong> We share data with trusted vendors who perform services on our behalf (e.g., AWS for hosting, Vercel for deployment, Firebase for authentication).</li>
              <li><strong>Legal Compliance:</strong> We may disclose your data if required by law or in response to valid requests by public authorities (e.g., court orders).</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition of all or a portion of our business.</li>
            </ul>
          </section>

          <section className="mb-10 bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <h2 className="text-2xl font-bold mb-4 text-primary">4. Children's Privacy Exemption</h2>
            <p>
              LearnVerse Spark Academy is intended for use by students. For users under the age of 13 (or under the age of digital consent in your region), we require the direct involvement and verifiable consent of a parent or legal guardian to create an account. Guardians have complete administrative oversight over their minor's data and can request modifications or deletions at any time.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">5. Account Deletion & Data Retention</h2>
            <p>
              We retain your information strictly for as long as your account remains active. However, you maintain the fundamental right to be forgotten. 
              <strong> When you request an account deletion, we programmatically and permanently delete your data within 60 days automatically.</strong> For extensive details on this process, please review our comprehensive <a href="/data-deletion-policy">Data Deletion Policy</a>.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">6. Security Measures</h2>
            <p>We have implemented strict operational and technological security measures designed to protect the security of any personal information we process. This includes end-to-end SSL encryption (HTTPS), hashed passwords, strict database authorization roles, and regular automated vulnerability auditing. However, please remember that no electronic transmission over the internet can be guaranteed to be 100% secure.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">7. Contact the Data Protection Officer</h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy, your data rights, or our security practices, you may contact our designated Data Protection Officer at:</p>
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl mt-4 border border-gray-200 dark:border-gray-800">
              <p className="m-0 font-medium">LearnVerse Spark Academy Legal Team</p>
              <p className="m-0 text-primary hover:underline"><a href="mailto:privacy@learnverse.lfvs.in">privacy@learnverse.lfvs.in</a></p>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicy;
