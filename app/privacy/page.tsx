import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy | FeedM.ee SaaS",
  description: "Privacy Policy and end-user data protection details for FeedM.ee creators and visitors.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 text-zinc-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-16 text-zinc-800 leading-relaxed">
        <div className="mb-10 pb-6 border-b border-zinc-200/80">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-950 mb-2">
            Privacy Policy
          </h1>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Last Updated: August 2026 • Data Protection &amp; Cookie Disclosure
          </p>
        </div>

        <section className="space-y-8 text-sm md:text-base font-medium text-zinc-700">
          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">1. Overview &amp; Data Protection Commitment</h2>
            <p className="leading-relaxed">
              At <strong>FeedM.ee</strong> (&quot;Platform&quot;, &quot;We&quot;, &quot;Us&quot;), we value the privacy of our creators and their visitors. 
              This Privacy Policy explains how personal data is collected, processed, and protected when using our link-in-bio and video feed services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">2. Information We Collect</h2>
            <p className="leading-relaxed mb-3">
              We collect information to provide, improve, and secure our SaaS platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li><strong>Account Registration:</strong> Full name, email address, password hash, and handle URL.</li>
              <li><strong>Captured Leads (CRM):</strong> Email address, phone number, and form submissions captured by creators through lead forms.</li>
              <li><strong>Analytics &amp; Usage:</strong> Aggregate page views, outbound link clicks, video plays, country code, browser type, and referrer headers.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">3. Creator Data Controller Status</h2>
            <p className="leading-relaxed">
              Creators using FeedM.ee custom lead forms are the sole Data Controllers for all end-user lead information collected through their profile feeds. 
              FeedM.ee acts as a Data Processor storing and transmitting leads on the creator&apos;s behalf. Creators are legally responsible for maintaining anti-spam and privacy compliance (GDPR, CCPA, CAN-SPAM).
            </p>
          </div>

          <div id="cookies" className="scroll-mt-24">
            <h2 className="text-xl font-black text-zinc-950 mb-2">4. Cookies &amp; Third-Party Tracking Pixels</h2>
            <p className="leading-relaxed">
              We use essential cookies for session management. Creators may optionally embed third-party tracking pixels (e.g., Meta Pixel, Google Analytics, TikTok Pixel). 
              Visitors can manage cookie preferences at any time via the &quot;Manage Cookies&quot; control on public profiles.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">5. Subscriptions &amp; Payment Processing</h2>
            <p className="leading-relaxed">
              All payment transactions and financial records are processed securely via 256-bit SSL encrypted payment gateways. 
              FeedM.ee never stores credit card or bank details on our servers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">6. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions or data removal requests regarding this Privacy Policy, please contact our privacy team at:{" "}
              <a href="mailto:support@feedm.ee" className="text-emerald-700 hover:text-emerald-800 font-bold underline">
                support@feedm.ee
              </a>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
