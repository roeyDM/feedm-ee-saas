import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobilePreview } from "@/components/mobile-preview";
import {
  Film,
  Sparkles,
  MessageCircle,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Layers,
  Send,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features & 5-Page Snap Reels | FeedM.ee",
  description:
    "Explore FeedM's interactive 5-page vertical video bio reels, direct WhatsApp lead capture, and CRM analytics.",
};

const ALEX_RIVERS_DEMO_REELS = [
  {
    id: "reel-alex-1",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-talking-on-a-cell-phone-41484-large.mp4",
    caption: "Stop losing 80% of your link-in-bio traffic! Here's how video snap reels double your conversion rate. 🚀",
    likes: 342,
    productTag: "Masterclass 2026",
    promoTitle: "Get 40% Off Creator Course",
    promoCta: "Claim Offer ⚡",
    promoUrl: "https://feedm.ee/pricing",
  },
  {
    id: "reel-alex-2",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-vlogging-with-her-cell-phone-in-a-park-41487-large.mp4",
    caption: "Turn casual Instagram & TikTok visitors into qualified WhatsApp leads in under 60 seconds! 📲",
    likes: 512,
    productTag: "WhatsApp Lead Tool",
    promoTitle: "Book 1-on-1 Strategy Call",
    promoCta: "Book Call 📅",
    promoUrl: "https://feedm.ee/pricing",
  },
];

const ALEX_RIVERS_LINKS = [
  {
    id: "link-1",
    title: "Join Creator Masterclass 2026 🚀",
    url: "https://feedm.ee/pricing",
    badgeText: "POPULAR",
    isActive: true,
  },
  {
    id: "link-2",
    title: "Download Free 2026 Video Bio Playbook 📘",
    url: "https://feedm.ee/pricing",
    badgeText: "FREE PDF",
    isActive: true,
  },
  {
    id: "link-3",
    title: "Book 1-on-1 Content Strategy Consultation 💼",
    url: "https://feedm.ee/pricing",
    isActive: true,
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-emerald-50/20 to-sky-50/30 text-zinc-900 font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="pt-28 pb-20">
        {/* ─── 1. HERO SECTION ───────────────────────────────────────────── */}
        <section className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 border border-zinc-200/80 shadow-sm px-4 py-1.5 text-xs font-bold text-zinc-800 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-[#00BC7D] animate-pulse" />
            <span>The Next-Generation 5-Page Snap Bio Platform</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl md:text-7xl leading-tight">
            Your videos are your bio. <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Built for instant conversion.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base font-medium text-zinc-600 sm:text-lg md:text-xl leading-relaxed">
            Move beyond static text link lists. FeedM combines Linktree-style bio links, vertical full-screen video reels, and an integrated lead capture form into a seamless 5-page snap experience.
          </p>
        </section>

        {/* ─── 2. INTERACTIVE DEMO SIMULATOR SECTION ─────────────────────── */}
        <section className="relative mx-auto max-w-6xl px-6 pt-12 pb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-zinc-950 sm:text-3xl">
              Experience the "Alex Rivers" Demo Feed
            </h2>
            <p className="text-xs font-semibold text-zinc-500 mt-1">
              Click or scroll inside the phone below to test bio links, video reels, and lead forms live.
            </p>
          </div>

          <div className="flex justify-center items-center">
            <MobilePreview
              profileName="Alex Rivers"
              username="alexrivers"
              bio="Digital Creator & Media Specialist 🚀 Helping creators build 7-figure video bio feeds."
              avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
              customHexColor="#bad1cb"
              socialLinks={[]}
              customLinks={ALEX_RIVERS_LINKS}
              reels={ALEX_RIVERS_DEMO_REELS}
              leadForm={{
                title: "Get in Touch with Alex",
                subtitle: "Leave your details below to request custom creator strategy consultation.",
                routeType: "email",
                target: "alex@riversmedia.com",
                is_phone_required: true,
                is_email_required: true,
                is_enabled: true,
              }}
              isDemoMode={true}
            />
          </div>
        </section>

        {/* ─── 3. CORE FEATURE CARDS ────────────────────────────────────── */}
        <section className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-zinc-950 sm:text-4xl">
              Engineered to Turn Viewers Into Customers
            </h2>
            <p className="text-sm font-semibold text-zinc-600 mt-2 max-w-xl mx-auto">
              Everything you need to showcase products, engage followers with short-form video, and collect leads in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white/90 p-8 shadow-xl shadow-zinc-900/5 backdrop-blur-md flex flex-col justify-between hover:border-emerald-300 transition-all">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00BC7D] flex items-center justify-center mb-5">
                  <Film className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-zinc-950 mb-2">Dynamic Video Reels</h3>
                <p className="text-xs font-medium text-zinc-600 leading-relaxed">
                  Upload up to 3 full-screen vertical video reels with TikTok-style snap scrolling. Include deal tags, custom titles, and instant CTA popups.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2 text-xs font-bold text-[#00BC7D]">
                <span>Full-screen Video Playback</span>
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white/90 p-8 shadow-xl shadow-zinc-900/5 backdrop-blur-md flex flex-col justify-between hover:border-emerald-300 transition-all">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00BC7D] flex items-center justify-center mb-5">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-zinc-950 mb-2">WhatsApp &amp; Phone Routing</h3>
                <p className="text-xs font-medium text-zinc-600 leading-relaxed">
                  Route visitors directly to your WhatsApp chat with custom pre-filled message templates, or enable 1-tap phone call buttons.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2 text-xs font-bold text-[#00BC7D]">
                <span>Click-to-Chat Integration</span>
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white/90 p-8 shadow-xl shadow-zinc-900/5 backdrop-blur-md flex flex-col justify-between hover:border-emerald-300 transition-all">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00BC7D] flex items-center justify-center mb-5">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-zinc-950 mb-2">Built-in Lead Form &amp; CRM</h3>
                <p className="text-xs font-medium text-zinc-600 leading-relaxed">
                  Capture names, phone numbers, and emails directly on your page. Automatically dispatches Resend notification emails and syncs to your dashboard CRM.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2 text-xs font-bold text-[#00BC7D]">
                <span>Automated Email &amp; Lead Capping</span>
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. FEATURE MATRIX COMPARISON ───────────────────────────────── */}
        <section className="relative mx-auto max-w-5xl px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-zinc-950 sm:text-4xl">
              Why Creators Switch to FeedM
            </h2>
            <p className="text-sm font-semibold text-zinc-600 mt-2">
              See how 5-Page Snap Reels compare to traditional static link tools.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-zinc-200/90 bg-white/90 shadow-xl backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80">
                  <th className="py-4 px-6 text-xs font-extrabold text-zinc-500 uppercase tracking-wider">Capability / Feature</th>
                  <th className="py-4 px-6 text-xs font-black text-[#00BC7D] uppercase tracking-wider bg-emerald-50/60">FeedM.ee (Snap Reels)</th>
                  <th className="py-4 px-6 text-xs font-extrabold text-zinc-500 uppercase tracking-wider">Traditional Tools (e.g. Linktree)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs font-semibold text-zinc-800">
                <tr>
                  <td className="py-4 px-6 font-bold">5-Page Vertical Snap Navigation</td>
                  <td className="py-4 px-6 bg-emerald-50/30 text-emerald-700 font-extrabold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#00BC7D]" /> Included
                  </td>
                  <td className="py-4 px-6 text-zinc-400">✕ Static 1-Page List</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold">Full-Screen Video Reels</td>
                  <td className="py-4 px-6 bg-emerald-50/30 text-emerald-700 font-extrabold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#00BC7D]" /> Included (3 Reels)
                  </td>
                  <td className="py-4 px-6 text-zinc-400">✕ Text Only / Embeds</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold">Direct WhatsApp Pre-filled Chat</td>
                  <td className="py-4 px-6 bg-emerald-50/30 text-emerald-700 font-extrabold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#00BC7D]" /> Native Integration
                  </td>
                  <td className="py-4 px-6 text-zinc-400">✕ Basic External Link</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold">Integrated Lead Capture Form</td>
                  <td className="py-4 px-6 bg-emerald-50/30 text-emerald-700 font-extrabold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#00BC7D]" /> Native CRM Included
                  </td>
                  <td className="py-4 px-6 text-zinc-400">✕ Requires Paid Addon</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold">Custom Subdomain &amp; Branding</td>
                  <td className="py-4 px-6 bg-emerald-50/30 text-emerald-700 font-extrabold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#00BC7D]" /> feedm.ee/yourname
                  </td>
                  <td className="py-4 px-6 text-zinc-600">✓ linktr.ee/yourname</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── 5. BOTTOM CTA BANNER ───────────────────────────────────────── */}
        <section className="relative mx-auto max-w-5xl px-6 pt-8 pb-12">
          <div className="rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-10 text-white text-center shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Ready to Launch Your 5-Page Video Feed?
              </h2>
              <p className="text-xs font-semibold text-zinc-400 max-w-lg mx-auto">
                Join thousands of visual creators and businesses capturing leads with video snap reels. Setup takes less than 60 seconds.
              </p>
              <div className="pt-2">
                <Link
                  href="/pricing"
                  style={{ backgroundColor: "#00BC7D" }}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-black text-white hover:opacity-90 shadow-lg shadow-[#00BC7D]/30 transition cursor-pointer"
                >
                  <span>Explore Plans &amp; Pricing</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
