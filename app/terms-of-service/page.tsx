import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms of Service | FeedM.ee SaaS",
  description: "Terms of Service and legal agreements for FeedM.ee creators and visual brands.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 text-zinc-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-16 text-zinc-800 leading-relaxed">
        <div className="mb-10 pb-6 border-b border-zinc-200/80">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-950 mb-2">
            Terms of Service
          </h1>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Last Updated: August 2026 • Official Legal Document
          </p>
        </div>

        <section className="space-y-8 text-sm md:text-base font-medium text-zinc-700">
          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By creating an account, accessing, or using <strong>FeedM.ee</strong> (&quot;Platform&quot;, &quot;Service&quot;, &quot;We&quot;, &quot;Us&quot;), 
              you agree to be bound by these Terms of Service. If you do not agree, please do not use our Platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">2. Description of Service</h2>
            <p className="leading-relaxed">
              FeedM.ee provides a Software-as-a-Service (SaaS) platform allowing digital creators and businesses to build 
              interactive link-in-bio pages, upload and host video reel feeds, embed custom lead-capture forms, manage leads 
              via an integrated CRM dashboard, inject tracking pixels, and view marketing analytics.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">3. User Accounts &amp; Handles</h2>
            <p className="leading-relaxed">
              You are responsible for maintaining the confidentiality of your credentials. You may register a unique handle 
              (e.g., <code className="bg-zinc-100 px-2 py-0.5 rounded text-xs font-mono text-emerald-800 border border-zinc-200">feedm.ee/@yourhandle</code>). We reserve the right to reclaim handles that infringe trademarks, 
              are abusive, or remain inactive for an extended period.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">4. Subscriptions, Payments &amp; Merchant of Record</h2>
            <p className="leading-relaxed">
              Our order process and subscription billing are conducted by our online reseller and Merchant of Record, 
              <strong className="text-zinc-950 font-bold"> Lemon Squeezy, LLC</strong>. Lemon Squeezy handles payment processing, customer service inquiries, 
              and tax collection (Sales Tax, VAT). Subscriptions automatically renew at the end of each billing cycle 
              (monthly or annually) unless canceled prior to the renewal date via your account billing settings.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">5. User Content, Video Hosting &amp; Conduct</h2>
            <p className="leading-relaxed">
              You retain ownership of all content, videos, text, and media you upload to FeedM.ee. However, by uploading content, 
              you grant us a global, non-exclusive license to host, display, and stream your media to deliver the Service.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-zinc-600">
              <li>You must hold all rights/licenses to the music, audio, and media in your videos.</li>
              <li>You are prohibited from uploading illegal, hateful, violent, explicit, or copyright-infringing content.</li>
              <li>We reserve the right to immediately suspend accounts violating content standards without refund.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">6. Lead Capture, CRM &amp; Privacy Compliance</h2>
            <p className="leading-relaxed">
              If you collect lead information (e.g., email addresses, phone numbers) through FeedM.ee custom forms:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-zinc-600">
              <li>You are the sole Data Controller of the collected end-user data.</li>
              <li>You agree to comply with applicable data protection laws (e.g., GDPR, CCPA, anti-spam laws).</li>
              <li>You must obtain proper legal consent from your visitors prior to sending marketing communications.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">7. Tracking Pixels &amp; Analytics</h2>
            <p className="leading-relaxed">
              If you embed third-party tracking pixels (e.g., Meta Pixel, Google Analytics, TikTok Pixel) into your FeedM.ee profile, 
              you are responsible for providing your site visitors with appropriate cookie notices and disclosures on 
              your external privacy policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">8. Limitation of Liability</h2>
            <p className="leading-relaxed">
              FeedM.ee is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We do not guarantee uninterrupted server uptime, 
              zero latency, or 100% data accuracy in analytics. In no event shall FeedM.ee be liable for indirect, punitive, 
              or consequential damages arising from service downtime or loss of leads.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">9. Termination</h2>
            <p className="leading-relaxed">
              You may cancel your account at any time. We reserve the right to terminate or restrict access to any user 
              violating these Terms without prior notice.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">10. Contact Us</h2>
            <p className="leading-relaxed">
              For any legal or account inquiries regarding these terms, please contact us at: 
              <a href="mailto:support@feedm.ee" className="text-emerald-700 hover:text-emerald-800 font-bold underline ml-1">
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
