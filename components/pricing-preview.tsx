"use client";

import React, { useState } from "react";
import { Check, Sparkles, Zap, Shield, Star, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PricingPreview() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  return (
    <div className="w-full bg-zinc-950 text-white min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Glow Effects Background */}
      <div className="max-w-7xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Flexible Plans for Every Creator
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Choose the Perfect Plan for <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">Your Feed</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed">
            Turn your social links into a video powerhouse. Collect leads, track analytics, and grow your audience seamlessly.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-6 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${billingCycle === "monthly" ? "text-white" : "text-zinc-400"}`}>
              Monthly
            </span>
            
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative w-14 h-7 rounded-full bg-zinc-800 p-1 transition-colors duration-200 focus:outline-none border border-zinc-700 cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full bg-emerald-400 transition-transform duration-200 ${
                  billingCycle === "yearly" ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${billingCycle === "yearly" ? "text-white" : "text-zinc-400"}`}>
                Yearly
              </span>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Save ~20%
              </span>
            </div>
          </div>
        </div>

        {/* 4-Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 items-stretch">
          {/* TIER 1: FREE */}
          <div className="flex flex-col justify-between bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all duration-300 shadow-xl group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-extrabold text-zinc-400 uppercase tracking-wider">Starter</span>
                <span className="h-2 w-2 rounded-full bg-zinc-500" />
              </div>
              <h3 className="text-xl font-black text-white">Free</h3>
              <p className="text-xs text-zinc-400 font-medium mt-1 min-h-[32px]">
                Perfect for getting started with a basic link-in-bio.
              </p>

              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-xs text-zinc-400 font-bold">/mo</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 font-medium">Free forever, no credit card needed</p>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 border-t border-zinc-800/80 pt-6">
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>🔗 1 FeedM.ee Link-in-Bio page</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>🎨 Full access to basic design themes</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>📝 Basic Lead Capture Form (Up to 5 leads/mo)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>📊 Basic Analytics &amp; Insights</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>🏷️ FeedM.ee branding on page</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Button
                variant="outline"
                className="w-full h-11 rounded-2xl border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer transition-all"
              >
                Get Started Free
              </Button>
            </div>
          </div>

          {/* TIER 2: PERSONAL */}
          <div className="flex flex-col justify-between bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all duration-300 shadow-xl group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-extrabold text-blue-400 uppercase tracking-wider">Personal</span>
                <Zap className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-xl font-black text-white">Creator</h3>
              <p className="text-xs text-zinc-400 font-medium mt-1 min-h-[32px]">
                Essential tools for content creators and micro-influencers.
              </p>

              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === "yearly" ? "$6" : "$8"}
                  </span>
                  <span className="text-xs text-zinc-400 font-bold">/mo</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 font-medium">
                  {billingCycle === "yearly" ? "Billed annually at $72/yr" : "Billed monthly"}
                </p>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 border-t border-zinc-800/80 pt-6">
                <p className="font-extrabold text-zinc-400 text-[11px] uppercase tracking-wider mb-2">Everything in Free, plus:</p>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>📹 Video Reels tab (Up to 3 videos)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>📝 Expanded Lead Capture (Up to 20 leads/mo)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>🚫 Remove FeedM.ee Branding (White-Label)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>🎨 Advanced custom designs &amp; fonts</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 text-center">
              <Button
                variant="outline"
                className="w-full h-11 rounded-2xl border-blue-500/40 text-blue-300 hover:bg-blue-500/10 font-bold text-xs cursor-pointer transition-all mb-1.5"
              >
                Start Free Trial
              </Button>
              <span className="text-[10px] text-zinc-500 font-semibold">Includes 7-day free trial</span>
            </div>
          </div>

          {/* TIER 3: PRO (HIGHLIGHTED / MOST POPULAR) */}
          <div className="relative flex flex-col justify-between bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-emerald-500/80 rounded-3xl p-6 transition-all duration-300 shadow-2xl shadow-emerald-500/10 transform lg:-translate-y-2 group">
            {/* Highlighted Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
              <Star className="h-3 w-3 fill-zinc-950" /> Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-1">
                <span className="text-sm font-extrabold text-emerald-400 uppercase tracking-wider">Pro ⭐</span>
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-white">Growth Pro</h3>
              <p className="text-xs text-zinc-300 font-medium mt-1 min-h-[32px]">
                Complete growth toolkit for serious creators &amp; businesses.
              </p>

              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-emerald-400">
                    {billingCycle === "yearly" ? "$12" : "$15"}
                  </span>
                  <span className="text-xs text-zinc-400 font-bold">/mo</span>
                </div>
                <p className="text-[11px] text-emerald-400/80 mt-1 font-medium">
                  {billingCycle === "yearly" ? "Billed annually at $144/yr" : "Billed monthly"}
                </p>
              </div>

              <div className="space-y-3 text-xs text-zinc-200 border-t border-zinc-800 pt-6">
                <p className="font-extrabold text-emerald-400 text-[11px] uppercase tracking-wider mb-2">Everything in Personal, plus:</p>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-semibold">📝 Unlimited Lead Capture</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-semibold">📇 Full Leads CRM System (Manage &amp; CSV export)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>🎯 Marketing Pixels Integration (Meta, TikTok, Google)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>📊 Detailed Analytics &amp; Conversion Tracking</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>⚡ Priority Support</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 text-center">
              <Button
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-zinc-950 font-black text-xs cursor-pointer shadow-lg shadow-emerald-500/25 transition-all mb-1.5"
              >
                Start Free Trial <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
              <span className="text-[10px] text-zinc-400 font-semibold">Includes 7-day free trial</span>
            </div>
          </div>

          {/* TIER 4: BUSINESS */}
          <div className="flex flex-col justify-between bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all duration-300 shadow-xl group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-extrabold text-purple-400 uppercase tracking-wider">Business</span>
                <Building2 className="h-4 w-4 text-purple-400" />
              </div>
              <h3 className="text-xl font-black text-white">Agency</h3>
              <p className="text-xs text-zinc-400 font-medium mt-1 min-h-[32px]">
                Built for agencies, multi-brand owners, and power users.
              </p>

              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === "yearly" ? "$29" : "$35"}
                  </span>
                  <span className="text-xs text-zinc-400 font-bold">/mo</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 font-medium">
                  {billingCycle === "yearly" ? "Billed annually at $348/yr" : "Billed monthly"}
                </p>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 border-t border-zinc-800/80 pt-6">
                <p className="font-extrabold text-zinc-400 text-[11px] uppercase tracking-wider mb-2">Everything in Pro, plus:</p>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>🗂️ Up to 5 Full FeedM.ee pages under 1 account</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>👥 Team Management (Invite collaborators)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>🔌 API &amp; Webhook Access (External CRM sync)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>🎧 Dedicated Premium Support</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 text-center">
              <Button
                variant="outline"
                className="w-full h-11 rounded-2xl border-purple-500/40 text-purple-300 hover:bg-purple-500/10 font-bold text-xs cursor-pointer transition-all mb-1.5"
              >
                Start Free Trial
              </Button>
              <span className="text-[10px] text-zinc-500 font-semibold">Includes 7-day free trial</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="mt-16 text-center flex items-center justify-center gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Cancel anytime with 1-click</span>
          </div>
          <span className="text-zinc-700">•</span>
          <div>Instant setup</div>
          <span className="text-zinc-700">•</span>
          <div>No hidden fees</div>
        </div>
      </div>
    </div>
  );
}
