import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/UI/button';
import { Trash2 } from 'lucide-react';

const DataDeletionPolicy = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 print:mb-4 tracking-tight">Account & Data Deletion Policy</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none prose-h2:text-primary prose-a:text-primary hover:prose-a:text-primary/80">
          <p className="text-sm text-gray-500 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            At LearnVerse Spark Academy, we respect your privacy and give you full control over your personal data. 
            This policy outlines how you can request the deletion of your account and the specific processes involved 
            in permanently removing your information from our systems.
          </p>

          <section className="mb-10 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              How to Request Account Deletion
            </h2>
            <p>You can request the deletion of your account and all associated personal data at any time through one of the following methods:</p>
            <ul className="list-none space-y-3 mt-4">
              <li className="flex gap-3">
                <strong className="min-w-[120px]">In-App:</strong>
                <span>
                  Navigate to <em>Settings Account Manage Account Request Account Deletion</em> in the web or mobile app, or visit the <Link to="/delete-account" className="font-semibold text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400">Account Deletion Page</Link> directly.
                </span>
              </li>
              <li className="flex gap-3">
                <strong className="min-w-[120px]">Via Email:</strong>
                <span>Send an email to <strong>privacy@learnverse.lfvs.in</strong> from the email address associated with your account, containing the subject line "Account Deletion Request".</span>
              </li>
            </ul>
            
            <div className="mt-8 flex justify-center border-t border-gray-200 dark:border-gray-800 pt-6">
              <Button 
                onClick={() => navigate('/delete-account')}
                variant="destructive"
                size="lg"
                className="gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Proceed to Delete Account
              </Button>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Our 60-Day Automatic Data Deletion Process
            </h2>
            <p>Once an account deletion request is initiated, we strictly adhere to the following timeline to ensure absolute data removal:</p>
            
            <div className="space-y-6 mt-6">
              <div className="border-l-4 border-amber-500 pl-4 py-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white m-0">Days 1 - 14: Grace Period</h3>
                <p className="m-0 mt-2 text-gray-600 dark:text-gray-400">Your account is immediately deactivated and rendered invisible to other users. You may log back in during this 14-day window to cancel your deletion request and restore your account.</p>
              </div>
              
              <div className="border-l-4 border-primary pl-4 py-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white m-0">Days 15 - 59: Queue for Secure Erasure</h3>
                <p className="m-0 mt-2 text-gray-600 dark:text-gray-400">If the request is not canceled, your account leaves the grace period. Your personal profile, learning history, and all direct identifiers are systematically purged from our active production databases.</p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4 py-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white m-0">Day 60: Permanent Deletion</h3>
                <p className="m-0 mt-2 text-gray-600 dark:text-gray-400 font-medium">All associated data is permanently and irreversibly destroyed from both our live servers and secondary backup systems. <span className="text-green-600 dark:text-green-400">We will delete all your data in 60 days automatically.</span></p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              What Data Gets Deleted?
            </h2>
            <p>At the end of the 60-day period, the following information is permanently erased:</p>
            <ul>
              <li><strong>Personal Identifiers:</strong> Name, Email address, phone number, and profile photos.</li>
              <li><strong>Academic Data:</strong> Course progress, quiz scores, downloaded materials, and saved notes.</li>
              <li><strong>Authentication Data:</strong> Passwords, session tokens, and connected OAuth providers (Google, Apple).</li>
              <li><strong>Financial History:</strong> Stripped from personal identifiers (transaction IDs remain for legal tax compliance, but are completely anonymized).</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
              Exceptions to Deletion
            </h2>
            <p>We are legally required to retain certain limited data points even after account deletion. These include:</p>
            <ul>
              <li><strong>Financial Transactions:</strong> Basic transaction logs required by tax authorities (retained for up to 7 years depending on jurisdiction).</li>
              <li><strong>Fraud Prevention:</strong> Device identifiers historically associated with malicious activity.</li>
              <li><strong>Anonymized Analytics:</strong> Aggregated, non-personally identifiable usage statistics used to improve platform quality.</li>
            </ul>
          </section>

          <section className="bg-primary/5 dark:bg-primary/10 p-6 rounded-xl mt-12">
            <h2 className="text-xl font-bold mb-2">Need Assistance?</h2>
            <p className="m-0 text-sm">
              If you have any questions regarding your data, privacy, or the deletion process, please do not hesitate to contact our Data Protection Officer at <a href="mailto:privacy@learnverse.lfvs.in" className="font-semibold">privacy@learnverse.lfvs.in</a>.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default DataDeletionPolicy;
