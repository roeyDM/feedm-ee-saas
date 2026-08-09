import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms of Service | FeedM.ee SaaS",
  description: "Terms of Service and legal agreements for FeedM.ee creators, visual brands, and business accounts.",
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
          {/* Section 1 */}
          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By creating an account, accessing, or using <strong>FeedM.ee</strong> (&quot;Platform&quot;, &quot;Service&quot;, &quot;We&quot;, &quot;Us&quot;), 
              you agree to be bound by these Terms of Service. If you do not agree, please do not use our Platform.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">2. Description of Service</h2>
            <p className="leading-relaxed">
              FeedM.ee provides a Software-as-a-Service (SaaS) platform allowing digital creators, influencers, and businesses to build 
              interactive link-in-bio pages, upload and host video reel feeds, embed custom lead-capture forms, manage leads 
              via an integrated CRM dashboard, inject tracking pixels, and view marketing analytics.
            </p>
          </div>

          {/* Section 3 - Expanded Username Squatting & Inactivity Policy */}
          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">3. User Accounts, Handle Ownership &amp; Inactivity Policy</h2>
            <p className="leading-relaxed mb-3">
              You are responsible for maintaining the confidentiality of your account credentials. When registering, you select a unique handle 
              (e.g., <code className="bg-zinc-100 px-2 py-0.5 rounded text-xs font-mono text-emerald-800 border border-zinc-200">feedm.ee/@yourhandle</code>).
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-600">
              <li>
                <strong>No Squatting or Resale:</strong> You may not register handles for the purpose of domain squatting, holding handles for future resale, or impersonating individuals, registered trademarks, or brand entities.
              </li>
              <li>
                <strong>Trademark Enforcement:</strong> We reserve the right to immediately reclaim or reassign any handle upon receiving a legitimate trademark infringement notice from a verified rights holder.
              </li>
              <li>
                <strong>Inactivity Clause:</strong> Accounts with zero login activity and zero public profile traffic for 6 consecutive months are deemed inactive. FeedM.ee reserves the right to terminate inactive free accounts and release or reassign their handles to active creators.
              </li>
            </ul>
          </div>

          {/* Section 4 - Merchant of Record */}
          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">4. Subscriptions, Payments &amp; Billing Rules</h2>
            <p className="leading-relaxed">
              Our order process and subscription billing are conducted by 
              <strong className="text-zinc-950 font-bold"> secure, 256-bit SSL encrypted payment gateways</strong>. Our payment partners handle secure card processing, customer service billing inquiries, 
              and global tax compliance (Sales Tax, VAT, GST). Subscriptions automatically renew at the end of each billing cycle 
              (monthly or annually) unless canceled prior to the renewal date via your account billing settings.
            </p>
          </div>

          {/* Section 5 - Video Feeds & Copyrighted Media */}
          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">5. User Content, Video Reels &amp; Copyright Licensing</h2>
            <p className="leading-relaxed">
              You retain ownership of all videos, audio, text, and media you upload to FeedM.ee. By uploading content, 
              you grant us a worldwide, non-exclusive license to host, transcode, display, and stream your media to deliver the Service.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-zinc-600">
              <li>
                <strong>Media Licensing Warranty:</strong> You warrant that you hold all legal rights, commercial licenses, or royalty-free permissions for all background music, sound effects, and video clips uploaded to your Video Reels feed.
              </li>
              <li>
                <strong>Prohibited Content:</strong> You are strictly prohibited from uploading illegal, hateful, violent, explicit, or copyright-infringing content.
              </li>
              <li>
                <strong>Enforcement &amp; Termination:</strong> FeedM.ee reserves the right to mute, remove, or terminate accounts uploading copyright-violating media without prior notice or refund.
              </li>
            </ul>
          </div>

          {/* Section 6 - Lead Generation & Data Controller Privacy */}
          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">6. Lead Capture Forms, CRM &amp; End-User Privacy Compliance</h2>
            <p className="leading-relaxed">
              If you collect visitor information (e.g., email addresses, phone numbers, lead data) through FeedM.ee custom lead forms:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-zinc-600">
              <li>
                <strong>Data Controller Status:</strong> You are the sole Data Controller of all lead data collected through your public profile form. FeedM.ee acts strictly as a Data Processor storing data on your behalf.
              </li>
              <li>
                <strong>Regulatory Compliance:</strong> You warrant that your lead collection complies with all applicable privacy regulations, including GDPR, CCPA, and CAN-SPAM anti-spam legislation.
              </li>
              <li>
                <strong>Consent Requirement:</strong> You must obtain explicit legal consent from end-users before adding their contact details to external marketing software or sending automated emails/SMS.
              </li>
            </ul>
          </div>

          {/* Section 7 - Tracking Pixels */}
          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">7. Tracking Pixels &amp; Analytics Disclosures</h2>
            <p className="leading-relaxed">
              If you inject third-party tracking pixels (e.g., Meta Pixel, Google Analytics, TikTok Pixel) into your FeedM.ee profile, 
              you are solely responsible for providing your end-users with necessary cookie consent notices and privacy disclosures in accordance with local privacy laws.
            </p>
          </div>

          {/* Section 8 - Limitation of Liability */}
          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">8. Limitation of Liability</h2>
            <p className="leading-relaxed">
              FeedM.ee is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We do not guarantee 100% server uptime, 
              uninterrupted video streaming, or zero error rates in analytics reporting. In no event shall FeedM.ee be liable for indirect, incidental, 
              or consequential damages arising from service downtime or loss of captured leads.
            </p>
          </div>

          {/* Section 9 - Termination */}
          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">9. Account Termination</h2>
            <p className="leading-relaxed">
              You may cancel your subscription or delete your account at any time. FeedM.ee reserves the right to suspend or terminate any account 
              violating these Terms without prior notice.
            </p>
          </div>

          {/* Section 10 - Contact */}
          <div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">10. Contact Information</h2>
            <p className="leading-relaxed">
              For any legal inquiries, trademark claims, or account support, please contact us at: 
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
