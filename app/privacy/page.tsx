"use client";

import React from "react";
import { Navbar } from "@/components/navbar";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-500/30 selection:text-emerald-900 flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-24 md:py-32">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-200/60">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-950 mb-4">
            Privacy Policy
          </h1>
          <p className="text-zinc-500 mb-10">Last Updated: August 2026</p>

          <div className="space-y-8 text-zinc-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-zinc-900 mb-3">1. Information We Collect</h2>
              <p className="mb-3">
                At FeedM.ee, we believe in being transparent about how we collect and use data. We collect information you provide directly to us, such as when you create or modify your account, request customer support, or interact with forms on our platform. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Account Data:</strong> Email address, name, username, and password.</li>
                <li><strong>Profile Contents:</strong> Links, video assets, texts, and settings you upload to your FeedM.ee profile.</li>
                <li><strong>Lead Data:</strong> Contact details (such as full name, email address, and phone number) submitted by end-users via lead capture forms embedded on FeedM.ee profiles.</li>
                <li><strong>Usage Analytics:</strong> Automatically collected information on how you interact with our services, including IP address, browser type, and device information.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-900 mb-3">2. How We Use Information</h2>
              <p className="mb-3">
                We use the information we collect to operate and improve FeedM.ee. Specifically, we use your data to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide, maintain, and improve our platform and user profiles.</li>
                <li>Process transactions and send related information, including confirmations and receipts.</li>
                <li>Dispatch real-time email notifications regarding new lead submissions to account owners.</li>
                <li>Send technical notices, updates, security alerts, and support messages.</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-900 mb-3">3. Data Sharing & Third Parties</h2>
              <p className="mb-3">
                We do not sell your personal data. We only share information with trusted third-party service providers who assist us in operating our platform:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Stripe:</strong> Used for secure payment processing. We do not store your full credit card details.</li>
                <li><strong>Supabase:</strong> Used for database hosting, user authentication, and secure file storage.</li>
                <li><strong>Resend:</strong> Used as our email delivery service provider for sending system alerts, transactional emails, and lead submission notifications.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-900 mb-3">4. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent, or you can manage your preferences using our Cookie Management tool available in the footer of user profiles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-900 mb-3">5. User Rights & Data Protection (GDPR/CCPA)</h2>
              <p className="mb-3">
                Depending on your location, you may have the right to access, correct, or delete your personal data. You have the right to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Request access to your personal data.</li>
                <li>Request correction of the personal data that we hold about you.</li>
                <li>Request erasure of your personal data.</li>
                <li>Object to processing of your personal data.</li>
                <li>Request the restriction of processing of your personal data.</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, please contact us directly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-900 mb-3">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@feedm.ee.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-zinc-200/50 bg-white py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950">
              <div className="h-4 w-4 rounded-full bg-emerald-400" />
            </div>
            <span className="text-lg font-black tracking-tight text-zinc-950">
              FeedM.ee
            </span>
          </div>
          <p className="text-sm text-zinc-500 font-medium">
            © {new Date().getFullYear()} FeedM.ee. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
