"use client";

import React, { useState } from "react";
import { Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PricingPreview() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  return (
    <div className="w-full bg-zinc-50 text-zinc-900 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-600 selection:text-white">
      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold uppercase tracking-wider">
            Flexible Plans for Every Creator
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-950">
            Choose the Perfect Plan for <span className="text-emerald-600">Your Feed</span>
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed">
            Turn your social links into a video powerhouse. Collect leads, track analytics, and grow your audience seamlessly.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-6 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold transition-colors ${billingCycle === "monthly" ? "text-zinc-950 font-black" : "text-zinc-500"}`}>
              Monthly
            </span>
            
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative w-14 h-7 rounded-full bg-zinc-200 p-1 transition-colors duration-200 focus:outline-none border border-zinc-300 cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full bg-emerald-600 transition-transform duration-200 shadow-sm ${
                  billingCycle === "yearly" ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold transition-colors ${billingCycle === "yearly" ? "text-zinc-950 font-black" : "text-zinc-500"}`}>
                Yearly
              </span>
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Save ~20%
              </span>
            </div>
          </div>
        </div>

        {/* 4-Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 items-stretch">
          {/* TIER 1: FREE */}
          <div className="flex flex-col justify-between bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all duration-300 h-full">
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
                <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs transition-all">
                  Get Started Free
                </Button>
                <div className="h-4" /> {/* Spacer placeholder to align with 7-day trial subtext */}
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
          <div className="flex flex-col justify-between bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all duration-300 h-full">
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
                <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs transition-all mb-1">
                  Start Free Trial
                </Button>
                <span className="text-[11px] text-zinc-500 font-semibold">Includes 7-day free trial</span>
              </div>

              {/* Features List */}
              <div className="space-y-3 text-xs text-zinc-700 border-t border-zinc-100 pt-6">
                <p className="font-extrabold text-zinc-400 text-[10px] uppercase tracking-wider mb-2">Everything in Free, plus:</p>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Video Reels tab (Up to 3 videos)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Expanded Lead Capture (Up to 20 leads/mo)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Remove FeedM.ee Branding (White-Label)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Advanced custom designs &amp; fonts</span>
                </div>
              </div>
            </div>
          </div>

          {/* TIER 3: PRO (HIGHLIGHTED / MOST POPULAR) */}
          <div className="relative flex flex-col justify-between bg-white border-2 border-emerald-500 rounded-3xl p-6 shadow-xl shadow-emerald-600/10 ring-1 ring-emerald-500/20 transform lg:-translate-y-2 h-full">
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
                <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md transition-all mb-1">
                  Start Free Trial
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
                  <span className="font-bold text-zinc-900">Full Leads CRM System (Manage &amp; CSV export)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Marketing Pixels Integration (Meta, TikTok, Google)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Detailed Analytics &amp; Conversion Tracking</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Priority Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* TIER 4: BUSINESS */}
          <div className="flex flex-col justify-between bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all duration-300 h-full">
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

              {/* CTA Button Positioned Above Features (No Trial Subtext) */}
              <div className="mb-6">
                <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs transition-all">
                  Contact Sales
                </Button>
                <div className="h-4" /> {/* Spacer placeholder to align with 7-day trial subtext */}
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

        {/* Footer Guarantee */}
        <div className="mt-16 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-medium">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>Cancel anytime with 1-click</span>
          </div>
          <span className="text-zinc-300 hidden sm:inline">•</span>
          <div>Instant setup</div>
          <span className="text-zinc-300 hidden sm:inline">•</span>
          <div>No hidden fees</div>
        </div>
      </div>
    </div>
  );
}
