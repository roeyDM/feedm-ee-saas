"use client";

import React, { useState } from "react";
import { Check, Shield, Building2, Mail, Send, X, Sparkles, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { FaqAccordion, PRICING_FAQS } from "@/components/faq-accordion";

export function PricingPreview() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [agencyMsg, setAgencyMsg] = useState("");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleCheckout = async (planType: "free" | "personal" | "pro" | "business") => {
    if (planType === "business") {
      setContactModalOpen(true);
      return;
    }

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Unauthenticated guest -> route to registration page with plan params
      window.location.href = `/register?plan=${planType}&billing=${billingCycle}`;
      return;
    }

    if (planType === "free") {
      window.location.href = "/dashboard";
      return;
    }

    try {
      setIsCheckoutLoading(true);
      let variantId = "";
      if (planType === "personal") {
        variantId = billingCycle === "yearly"
          ? (process.env.LEMONSQUEEZY_VARIANT_PERSONAL_YEARLY || "1996076")
          : (process.env.LEMONSQUEEZY_VARIANT_PERSONAL_MONTHLY || "1996051");
      } else if (planType === "pro") {
        variantId = billingCycle === "yearly"
          ? (process.env.LEMONSQUEEZY_VARIANT_PRO_YEARLY || "1996078")
          : (process.env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY || "1996077");
      } else if (planType === "business") {
        variantId = billingCycle === "yearly"
          ? (process.env.LEMONSQUEEZY_VARIANT_BUSINESS_YEARLY || "1996084")
          : (process.env.LEMONSQUEEZY_VARIANT_BUSINESS_MONTHLY || "1996082");
      }

      const res = await fetch("/api/checkout/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, planType }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = `/dashboard?upgrade=${planType}&cycle=${billingCycle}`;
      }
    } catch (err) {
      window.location.href = `/dashboard?upgrade=${planType}&cycle=${billingCycle}`;
    } finally {
      setIsCheckoutLoading(false);
    }
  };

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
      {/* Background Pastel Orbs (Exact copy from live pricing page) */}
      <div className="pointer-events-none absolute top-[-10%] left-[-5%] w-[45%] aspect-square rounded-full bg-[#bad1cb]/40 blur-[130px]" />
      <div className="pointer-events-none absolute top-[20%] right-[-5%] w-[40%] aspect-square rounded-full bg-[#fde68a]/35 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-5%] left-[20%] w-[45%] aspect-square rounded-full bg-[#e0f2fe]/50 blur-[130px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative z-10">
        {/* Hero Header (Exact typography copy from live pricing page) */}
        <section className="relative mx-auto max-w-4xl px-6 pb-12 text-center">
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
            Start for free, then upgrade to unlock 3 snap video reels, custom domains, and instant WhatsApp lead forms.
          </p>

          {/* Annual / Monthly Toggle Container (Exact copy from live page) */}
          <div className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-white/80 p-1.5 border border-zinc-200/80 shadow-md backdrop-blur-md">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === "yearly"
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

        {/* 4-Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 items-stretch">
          {/* TIER 1: FREE */}
          <div className="flex flex-col justify-between bg-white/90 border border-zinc-200/80 rounded-3xl p-6 shadow-lg shadow-zinc-900/5 backdrop-blur-md hover:border-zinc-300 transition-all duration-300 h-full">
            <div>
              <div className="mb-4">
                <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Starter</span>
                <h3 className="text-xl font-black text-zinc-950 mt-1">Free</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1 min-h-[36px]">
                  Perfect for getting started with a basic link-in-bio.
                </p>
              </div>

              {/* Price Section */}
              <div className="my-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-zinc-950">$0</span>
                  <span className="text-xs text-zinc-500 font-bold">/mo</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 font-medium">Free forever, no credit card needed</p>
              </div>

              {/* CTA Button Positioned Above Features */}
              <div className="mb-6">
                <Button 
                  onClick={() => handleCheckout("free")}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs transition-all"
                >
                  Get Started Free
                </Button>
                <div className="h-4" />
              </div>

              {/* Features List */}
              <div className="space-y-3 text-xs text-zinc-700 border-t border-zinc-100 pt-6">
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>1 FeedM.ee Link-in-Bio page</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Full access to basic design themes</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Basic Lead Capture Form (Up to 5 leads/mo)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Basic Analytics &amp; Insights</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>FeedM.ee branding on page</span>
                </div>
              </div>
            </div>
          </div>

          {/* TIER 2: PERSONAL */}
          <div className="flex flex-col justify-between bg-white/90 border border-zinc-200/80 rounded-3xl p-6 shadow-lg shadow-zinc-900/5 backdrop-blur-md hover:border-zinc-300 transition-all duration-300 h-full">
            <div>
              <div className="mb-4">
                <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Creator</span>
                <h3 className="text-xl font-black text-zinc-950 mt-1">Personal</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1 min-h-[36px]">
                  Essential tools for content creators and micro-influencers.
                </p>
              </div>

              {/* Price Section */}
              <div className="my-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-zinc-950">
                    {billingCycle === "yearly" ? "$6" : "$8"}
                  </span>
                  <span className="text-xs text-zinc-500 font-bold">/mo</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 font-medium">
                  {billingCycle === "yearly" ? "Billed annually at $72/yr" : "Billed monthly"}
                </p>
              </div>

              {/* CTA Button Positioned Above Features */}
              <div className="mb-6 text-center">
                <Button 
                  onClick={() => handleCheckout("personal")}
                  disabled={isCheckoutLoading}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs transition-all mb-1"
                >
                  {isCheckoutLoading ? "Loading..." : "Start Free Trial"}
                </Button>
                <span className="text-[11px] text-zinc-500 font-semibold">Includes 7-day free trial</span>
              </div>

              {/* Features List */}
              <div className="space-y-3 text-xs text-zinc-700 border-t border-zinc-100 pt-6">
                <p className="font-extrabold text-zinc-400 text-[10px] uppercase tracking-wider mb-2">Everything in Free, plus:</p>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>3 Vertical Video Snap Reels</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Lead Capture (Up to 20 leads/mo)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Remove Feed Me Branding (White-Label)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Advanced design themes &amp; fonts</span>
                </div>
              </div>
            </div>
          </div>

          {/* TIER 3: PRO (HIGHLIGHTED / MOST POPULAR) */}
          <div className="relative flex flex-col justify-between bg-white border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl shadow-emerald-600/15 backdrop-blur-md transform lg:-translate-y-2 h-full">
            {/* Top Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              MOST POPULAR
            </div>

            <div>
              <div className="mb-4 mt-1">
                <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Growth Pro</span>
                <h3 className="text-xl font-black text-zinc-950 mt-1">Pro</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1 min-h-[36px]">
                  Complete growth toolkit for serious creators &amp; businesses.
                </p>
              </div>

              {/* Price Section */}
              <div className="my-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-emerald-600">
                    {billingCycle === "yearly" ? "$12" : "$15"}
                  </span>
                  <span className="text-xs text-zinc-500 font-bold">/mo</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  {billingCycle === "yearly" ? "Billed annually at $144/yr" : "Billed monthly"}
                </p>
              </div>

              {/* CTA Button Positioned Above Features */}
              <div className="mb-6 text-center">
                <Button 
                  onClick={() => handleCheckout("pro")}
                  disabled={isCheckoutLoading}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md transition-all mb-1"
                >
                  {isCheckoutLoading ? "Loading..." : "Start Free Trial"}
                </Button>
                <span className="text-[11px] text-zinc-500 font-semibold">Includes 7-day free trial</span>
              </div>

              {/* Features List */}
              <div className="space-y-3 text-xs text-zinc-700 border-t border-zinc-100 pt-6">
                <p className="font-extrabold text-emerald-700 text-[10px] uppercase tracking-wider mb-2">Everything in Personal, plus:</p>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-bold text-zinc-900">Unlimited Lead Capture</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-bold text-zinc-900">Marketing Pixels (Meta, TikTok, Google)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Full Analytics &amp; Video Engagement Stats</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Priority Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* TIER 4: BUSINESS */}
          <div className="flex flex-col justify-between bg-white/90 border border-zinc-200/80 rounded-3xl p-6 shadow-lg shadow-zinc-900/5 backdrop-blur-md hover:border-zinc-300 transition-all duration-300 h-full">
            <div>
              <div className="mb-4">
                <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Enterprise</span>
                <h3 className="text-xl font-black text-zinc-950 mt-1">Business</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1 min-h-[36px]">
                  Built for agencies, multi-brand owners, and power users.
                </p>
              </div>

              {/* Price Section */}
              <div className="my-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-zinc-950">
                    {billingCycle === "yearly" ? "$29" : "$35"}
                  </span>
                  <span className="text-xs text-zinc-500 font-bold">/mo</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 font-medium">
                  {billingCycle === "yearly" ? "Billed annually at $348/yr" : "Billed monthly"}
                </p>
              </div>

              {/* CTA Button Positioned Above Features (Get Started Now) */}
              <div className="mb-6">
                <Button 
                  onClick={() => handleCheckout("business")}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs transition-all"
                >
                  Get Started Now
                </Button>
                <div className="h-4" />
              </div>

              {/* Features List */}
              <div className="space-y-3 text-xs text-zinc-700 border-t border-zinc-100 pt-6">
                <p className="font-extrabold text-zinc-400 text-[10px] uppercase tracking-wider mb-2">Everything in Pro, plus:</p>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Up to 5 Full FeedM.ee pages under 1 account</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Team Management (Invite collaborators)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>API &amp; Webhook Access (External CRM sync)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Dedicated Premium Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Button: Smooth scroll to full feature comparison table */}
        <div className="mt-8 text-center">
          <a
            href="#full-feature-list"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("full-feature-list");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white/90 hover:bg-white border border-emerald-300/80 px-5 py-2.5 rounded-full shadow-xs transition-all cursor-pointer group backdrop-blur-md"
          >
            <span>View Full Feature Comparison</span>
            <ArrowDown className="h-3.5 w-3.5 text-emerald-600 group-hover:translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Footer Guarantee */}
        <div className="mt-14 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-medium">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>Cancel anytime with 1-click</span>
          </div>
          <span className="text-zinc-300 hidden sm:inline">•</span>
          <div>Instant setup</div>
          <span className="text-zinc-300 hidden sm:inline">•</span>
          <div>No hidden fees</div>
        </div>

        {/* Custom Enterprise / Agency Banner (Exact copy from live page) */}
        <div className="mt-14 relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-r from-zinc-900 via-zinc-950 to-slate-900 p-8 sm:p-12 text-white shadow-2xl">
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
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold text-xs h-12 px-8 rounded-xl shrink-0 shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center gap-2"
            >
              Contact Sales <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ACCURATE FULL FEATURE COMPARISON TABLE */}
        {/* ======================================================== */}
        <div id="full-feature-list" className="mt-16 space-y-6 pt-4 scroll-mt-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-200">
              Detailed Breakdown
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              Compare All Features Across Plans
            </h2>
            <p className="text-xs sm:text-sm font-medium text-zinc-600">
              Comprehensive parameter comparison for Free, Personal, Pro, and Business tiers.
            </p>
          </div>

          <div className="bg-white/95 rounded-3xl border border-zinc-200/90 shadow-xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px] table-fixed">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-zinc-50/90">
                    <th className="p-4 sm:p-5 text-xs font-extrabold text-zinc-500 uppercase tracking-wider w-2/6">
                      Feature &amp; Parameter
                    </th>
                    <th className="p-4 text-center text-xs font-bold text-zinc-700 w-1/6 align-top">
                      <span className="block font-black text-sm text-zinc-900 mb-1">Starter (Free)</span>
                      <span className="block text-[11px] font-medium text-zinc-500 mb-2.5">$0 / mo</span>
                      <Button
                        onClick={() => handleCheckout("free")}
                        variant="outline"
                        className="w-full h-8 text-[11px] font-bold rounded-xl border-zinc-300 hover:bg-zinc-100 text-zinc-800 cursor-pointer shadow-2xs"
                      >
                        Get Started
                      </Button>
                    </th>
                    <th className="p-4 text-center text-xs font-bold text-zinc-900 w-1/6 align-top">
                      <span className="block font-black text-sm text-zinc-950 mb-1">Personal</span>
                      <span className="block text-[11px] font-medium text-zinc-500 mb-2.5">
                        {billingCycle === "yearly" ? "$6/mo" : "$8/mo"}
                      </span>
                      <Button
                        onClick={() => handleCheckout("personal")}
                        className="w-full h-8 text-[11px] font-extrabold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer shadow-2xs"
                      >
                        Get Personal
                      </Button>
                    </th>
                    <th className="p-4 text-center text-xs font-black text-emerald-950 bg-emerald-100/70 border-x border-emerald-200/90 w-1/6 align-top">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="font-black text-sm text-emerald-950">Growth Pro</span>
                      </div>
                      <span className="block text-[11px] font-bold text-emerald-700 mb-2.5">
                        {billingCycle === "yearly" ? "$12/mo" : "$15/mo"}
                      </span>
                      <Button
                        onClick={() => handleCheckout("pro")}
                        className="w-full h-8 text-[11px] font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                      >
                        Try Pro Free
                      </Button>
                    </th>
                    <th className="p-4 text-center text-xs font-bold text-zinc-900 w-1/6 align-top">
                      <span className="block font-black text-sm text-zinc-950 mb-1">Business</span>
                      <span className="block text-[11px] font-medium text-zinc-500 mb-2.5">
                        {billingCycle === "yearly" ? "$29/mo" : "$35/mo"}
                      </span>
                      <Button
                        onClick={() => handleCheckout("business")}
                        className="w-full h-8 text-[11px] font-extrabold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer shadow-2xs"
                      >
                        Contact Sales
                      </Button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {/* Category 1 */}
                  <tr className="bg-zinc-100/70 font-black text-zinc-900 uppercase text-[10px] tracking-wider">
                    <td colSpan={5} className="py-3 px-5 bg-zinc-100/90 text-zinc-800 font-extrabold text-xs">
                      1. Video Feed &amp; Player
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Video Snap Reels Limit</td>
                    <td className="p-4 text-center text-zinc-500 font-medium">0 Videos (Static Bio)</td>
                    <td className="p-4 text-center font-bold text-zinc-900">3 Videos</td>
                    <td className="p-4 text-center font-extrabold text-emerald-950 bg-emerald-50/50 border-x border-emerald-200/80">3 Videos</td>
                    <td className="p-4 text-center font-bold text-zinc-900">3 Videos / Feed</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">TikTok-Style Vertical Feed</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Video Promo &amp; Deal Popup Overlays</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Auto-Looping &amp; Audio Mute Controls</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                  </tr>

                  {/* Category 2 */}
                  <tr className="bg-zinc-100/70 font-black text-zinc-900 uppercase text-[10px] tracking-wider">
                    <td colSpan={5} className="py-3 px-5 bg-zinc-100/90 text-zinc-800 font-extrabold text-xs">
                      2. Lead Capture &amp; CRM
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Monthly Lead Capture Quota</td>
                    <td className="p-4 text-center text-zinc-600 font-bold">5 Leads / mo</td>
                    <td className="p-4 text-center font-bold text-zinc-900">20 Leads / mo</td>
                    <td className="p-4 text-center font-extrabold text-emerald-950 bg-emerald-50/50 border-x border-emerald-200/80">Unlimited</td>
                    <td className="p-4 text-center font-bold text-zinc-900">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Custom Builder Lead Forms</td>
                    <td className="p-4 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Coming Soon</span></td>
                    <td className="p-4 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Coming Soon</span></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Coming Soon</span></td>
                    <td className="p-4 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Coming Soon</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">WhatsApp 1-Click Instant Route</td>
                    <td className="p-4 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Coming Soon</span></td>
                    <td className="p-4 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Coming Soon</span></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Coming Soon</span></td>
                    <td className="p-4 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Coming Soon</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Leads CRM Manager &amp; CSV Export</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">API &amp; Webhook Sync</td>
                    <td className="p-4 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Coming Soon</span></td>
                    <td className="p-4 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Coming Soon</span></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Coming Soon</span></td>
                    <td className="p-4 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Coming Soon</span></td>
                  </tr>

                  {/* Category 3 */}
                  <tr className="bg-zinc-100/70 font-black text-zinc-900 uppercase text-[10px] tracking-wider">
                    <td colSpan={5} className="py-3 px-5 bg-zinc-100/90 text-zinc-800 font-extrabold text-xs">
                      3. Customization &amp; Branding
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Custom Bio Links &amp; Social Icons</td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Color Palettes &amp; Typography Themes</td>
                    <td className="p-4 text-center text-zinc-500 font-medium">Basic Themes</td>
                    <td className="p-4 text-center font-bold text-zinc-900">Advanced Themes</td>
                    <td className="p-4 text-center font-extrabold text-emerald-950 bg-emerald-50/50 border-x border-emerald-200/80">Advanced Themes</td>
                    <td className="p-4 text-center font-bold text-zinc-900">Full Custom CSS</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">White-Label (Remove FeedM.ee Badge)</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Feed Handles per Account</td>
                    <td className="p-4 text-center text-zinc-500 font-medium">1 Feed</td>
                    <td className="p-4 text-center font-bold text-zinc-900">1 Feed</td>
                    <td className="p-4 text-center font-extrabold text-emerald-950 bg-emerald-50/50 border-x border-emerald-200/80">1 Feed (+ Add-ons)</td>
                    <td className="p-4 text-center font-bold text-zinc-900">5 Feeds Included</td>
                  </tr>

                  {/* Category 4 */}
                  <tr className="bg-zinc-100/70 font-black text-zinc-900 uppercase text-[10px] tracking-wider">
                    <td colSpan={5} className="py-3 px-5 bg-zinc-100/90 text-zinc-800 font-extrabold text-xs">
                      4. Analytics &amp; Marketing Tech
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Traffic Overview &amp; Page Views</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center text-zinc-700 font-medium">Basic Counts</td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Outbound Link Click Tracking</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center text-zinc-700 font-medium">Basic Counts</td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Video Reel Play Engagement Rates</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Marketing Pixels (Meta, TikTok, Google)</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                  </tr>

                  {/* Category 5 */}
                  <tr className="bg-zinc-100/70 font-black text-zinc-900 uppercase text-[10px] tracking-wider">
                    <td colSpan={5} className="py-3 px-5 bg-zinc-100/90 text-zinc-800 font-extrabold text-xs">
                      5. Security &amp; Support
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">256-Bit SSL Encryption</td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Two-Factor Authentication (2FA TOTP)</td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-4 w-4 text-emerald-600 stroke-[3] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Team Collaborators</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center bg-emerald-50/50 border-x border-emerald-200/80"><X className="h-4 w-4 text-zinc-300 mx-auto" /></td>
                    <td className="p-4 text-center font-bold text-zinc-900">Multi-User Seats</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-sm sm:text-base font-semibold text-zinc-950">Support Level</td>
                    <td className="p-4 text-center text-zinc-500 font-medium">Community</td>
                    <td className="p-4 text-center font-bold text-zinc-900">Standard Email</td>
                    <td className="p-4 text-center font-extrabold text-emerald-950 bg-emerald-50/50 border-x border-emerald-200/80">Priority Support</td>
                    <td className="p-4 text-center font-bold text-zinc-900">Priority Support</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pricing Page Product & Billing FAQ Section */}
        <FaqAccordion
          badge="Billing &amp; Product FAQ"
          title="Pricing &amp; Subscription FAQs"
          subtitle="Clear, transparent answers to common questions about plans, trials, billing, and cancellations."
          items={PRICING_FAQS}
        />
      </div>

      {/* Enterprise Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl">
            <button
              onClick={() => setContactModalOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 cursor-pointer"
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
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md mt-2 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-4 w-4" /> Submit Enterprise Inquiry
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
