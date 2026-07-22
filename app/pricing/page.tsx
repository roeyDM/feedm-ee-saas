"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Film,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Building2,
  HelpCircle,
  ArrowRight,
  X,
  MessageCircle,
  Mail,
  Send,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [agencyMsg, setAgencyMsg] = useState("");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactModalOpen(false);
      setContactSubmitted(false);
      setAgencyName("");
      setAgencyEmail("");
      setAgencyMsg("");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-emerald-50/30 to-sky-50/40 text-zinc-900 font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Background Pastel Orbs */}
      <div className="pointer-events-none absolute top-[-10%] left-[-5%] w-[45%] aspect-square rounded-full bg-[#bad1cb]/40 blur-[130px]" />
      <div className="pointer-events-none absolute top-[20%] right-[-5%] w-[40%] aspect-square rounded-full bg-[#fde68a]/35 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-5%] left-[20%] w-[45%] aspect-square rounded-full bg-[#e0f2fe]/50 blur-[130px]" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/60 bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 shadow-md shadow-emerald-500/20">
              <Film className="h-5 w-5 text-white stroke-[2.5]" />
            </div>
            <span className="text-xl font-black text-zinc-950 tracking-tight">
              FeedM<span className="text-emerald-600">.ee</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="hidden sm:inline-block text-xs font-bold text-zinc-600 hover:text-zinc-950 transition">
              Home
            </Link>
            <Link href="/alexrivers" className="hidden sm:inline-block text-xs font-bold text-zinc-600 hover:text-zinc-950 transition">
              Creator Demo
            </Link>
            <Link href="/login" className="text-xs font-bold text-zinc-700 hover:text-emerald-600 transition px-2 py-1">
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs rounded-xl shadow-md transition">
                Get Started Free <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative mx-auto max-w-4xl px-6 pt-16 pb-8 text-center lg:pt-20">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 border border-zinc-200/80 shadow-sm px-4 py-1.5 text-xs font-bold text-zinc-800 backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span>Simple, Transparent Pricing for Visual Creators</span>
        </div>

        <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl md:text-6xl leading-tight">
          Supercharge your Bio Reel. <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Choose the right plan.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base font-medium text-zinc-600 sm:text-lg">
          Start for free, then upgrade to unlock custom handles, 3 snap video reels, and instant WhatsApp lead forms.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-white/80 p-1.5 border border-zinc-200/80 shadow-md backdrop-blur-md">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              !isAnnual
                ? "bg-zinc-950 text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              isAnnual
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-zinc-950 uppercase tracking-wider">
              Save ~20%
            </span>
          </button>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">

          {/* Tier 1: FREE */}
          <div className="flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white/90 p-8 shadow-lg shadow-zinc-900/5 backdrop-blur-md hover:border-zinc-300 transition duration-300">
            <div>
              <div className="inline-block rounded-xl bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 mb-4">
                Starter
              </div>
              <h2 className="text-2xl font-black text-zinc-950">Free Forever</h2>
              <p className="text-xs font-medium text-zinc-500 mt-1">
                Perfect for trying out your first link-in-bio page.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-zinc-950">$0</span>
                <span className="text-xs font-bold text-zinc-400">/ month forever</span>
              </div>

              <hr className="my-6 border-zinc-100" />

              <ul className="space-y-3.5 text-xs font-semibold text-zinc-700">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Page 1: Custom Bio &amp; Linktree Links</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Custom Hex Color Picker Engine</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>System Handle (<code className="text-zinc-500">feedm.ee/u_123</code>)</span>
                </li>
                <li className="flex items-start gap-2.5 text-zinc-400">
                  <X className="h-4 w-4 text-zinc-300 shrink-0 mt-0.5" />
                  <span className="line-through">Video Reels (Pages 2–4)</span>
                </li>
                <li className="flex items-start gap-2.5 text-zinc-400">
                  <X className="h-4 w-4 text-zinc-300 shrink-0 mt-0.5" />
                  <span className="line-through">Lead Contact Form (Page 5)</span>
                </li>
                <li className="flex items-start gap-2.5 text-zinc-400">
                  <X className="h-4 w-4 text-zinc-300 shrink-0 mt-0.5" />
                  <span className="line-through">Custom Handle (<code className="text-zinc-500">feedm.ee/yourname</code>)</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link href="/signup?plan=free">
                <Button variant="outline" className="w-full h-11 rounded-xl text-xs font-bold border-zinc-200 hover:bg-zinc-100 text-zinc-900">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>

          {/* Tier 2: PRO (CREATOR) - HIGHLIGHTED */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-emerald-500 bg-white p-8 shadow-2xl shadow-emerald-600/15 backdrop-blur-md scale-[1.02] z-10">
            {/* Best Value Ribbon */}
            <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-1 text-[11px] font-black text-white shadow-md flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-current" /> MOST POPULAR
            </div>

            <div>
              <div className="inline-block rounded-xl bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-800 mb-4">
                Pro Creator
              </div>
              <h2 className="text-2xl font-black text-zinc-950">Pro Plan</h2>
              <p className="text-xs font-medium text-zinc-500 mt-1">
                Full 5-Page Snap Reel profile for serious visual creators.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-black text-zinc-950">
                  {isAnnual ? "$7" : "$9"}
                </span>
                <span className="text-xs font-bold text-zinc-500">/ month</span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                {isAnnual ? "Billed $84 annually (Save ~$24/yr)" : "Billed monthly"}
              </p>

              <hr className="my-6 border-zinc-100" />

              <ul className="space-y-3.5 text-xs font-bold text-zinc-800">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                  <span><strong>Custom Handle:</strong> <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">feedm.ee/yourname</code></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                  <span><strong>3 Vertical Snap Video Reels:</strong> Direct Supabase video upload (.mp4 / .mov)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                  <span><strong>Lead Contact Form:</strong> Page 5 lead collection directly to dashboard</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                  <span><strong>Action Buttons:</strong> Instant WhatsApp &amp; Phone Call buttons on reels</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                  <span><strong>Coupon Badges:</strong> Styled Linktree links with discount codes</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                  <span><strong>No Watermark:</strong> 100% clean custom branded page</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link href="/signup?plan=pro">
                <Button className="w-full h-11 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25">
                  Upgrade to Pro <Zap className="h-4 w-4 ml-1.5 fill-current" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Tier 3: BUSINESS (BRAND) */}
          <div className="flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white/90 p-8 shadow-lg shadow-zinc-900/5 backdrop-blur-md hover:border-zinc-300 transition duration-300">
            <div>
              <div className="inline-block rounded-xl bg-cyan-100/80 px-3 py-1 text-xs font-bold text-cyan-800 mb-4">
                Business &amp; Brand
              </div>
              <h2 className="text-2xl font-black text-zinc-950">Business Plan</h2>
              <p className="text-xs font-medium text-zinc-500 mt-1">
                For brands and businesses scaling high-converting video campaigns.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-zinc-950">
                  {isAnnual ? "$24" : "$29"}
                </span>
                <span className="text-xs font-bold text-zinc-500">/ month</span>
              </div>
              <p className="text-[11px] font-semibold text-cyan-700 mt-1">
                {isAnnual ? "Billed $288 annually" : "Billed monthly"}
              </p>

              <hr className="my-6 border-zinc-100" />

              <ul className="space-y-3.5 text-xs font-semibold text-zinc-700">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span><strong>Everything in Pro Plan</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>Unlimited Video Reel Hosting</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>Custom Domain Support (<code className="text-zinc-500">bio.yourdomain.com</code>)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>Zapier &amp; Webhook CRM Lead Export</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>Priority 24/7 Dedicated Support</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link href="/signup?plan=business">
                <Button variant="outline" className="w-full h-11 rounded-xl text-xs font-bold border-zinc-900 bg-zinc-950 text-white hover:bg-black">
                  Start Business Trial
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Enterprise & Agency Section */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-r from-zinc-900 via-zinc-950 to-slate-900 p-8 sm:p-12 text-white shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                <Building2 className="h-4 w-4" /> Enterprise &amp; Agencies
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Need a custom plan for your agency or enterprise?
              </h2>
              <p className="text-xs sm:text-sm font-medium text-zinc-400 leading-relaxed">
                Get bulk licenses, custom SLA agreements, white-label branding for your client roster, and a dedicated account manager.
              </p>
            </div>

            <Button
              onClick={() => setContactModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold text-xs h-12 px-8 rounded-xl shrink-0 shadow-lg shadow-emerald-500/25 transition"
            >
              Contact Sales <MessageCircle className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Enterprise Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setContactModalOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>

            {contactSubmitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Check className="h-8 w-8 stroke-[3]" />
                </div>
                <h3 className="text-xl font-black text-zinc-950">Message Sent!</h3>
                <p className="text-xs font-medium text-zinc-600 mt-2">
                  Our enterprise sales team will reach out to you within 24 hours.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-black text-zinc-950">Contact Enterprise Sales</h3>
                <p className="text-xs font-medium text-zinc-500 mt-1 mb-6">
                  Tell us about your team size or agency needs and we'll craft a custom quote.
                </p>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Agency / Company Name</label>
                    <input
                      type="text"
                      required
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder="Acme Agency Studios"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Business Email</label>
                    <input
                      type="email"
                      required
                      value={agencyEmail}
                      onChange={(e) => setAgencyEmail(e.target.value)}
                      placeholder="alex@acme.com"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Project / Team Details</label>
                    <textarea
                      rows={3}
                      required
                      value={agencyMsg}
                      onChange={(e) => setAgencyMsg(e.target.value)}
                      placeholder="Number of client profiles needed, white-label requirements, etc..."
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md mt-2"
                  >
                    Submit Enterprise Inquiry <Send className="h-4 w-4 ml-1.5" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-200/60 py-10 text-center text-xs text-zinc-500 mt-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <Film className="h-3.5 w-3.5" />
            </div>
            <span className="font-extrabold text-zinc-950">FeedM.ee</span>
          </div>
          <p>© {new Date().getFullYear()} FeedM.ee. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
