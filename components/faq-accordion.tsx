"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  items: FaqItem[];
  id?: string;
}

export function FaqAccordion({
  title = "Frequently Asked Questions",
  subtitle = "Have questions? Everything you need to know about Feedme.",
  badge = "FAQ",
  items,
  id,
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id={id} className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-10">
      <div className="text-center space-y-2 mb-10">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-3.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5 shadow-2xs">
          <HelpCircle className="h-3.5 w-3.5 text-emerald-600" />
          <span>{badge}</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-zinc-600 max-w-xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200/90 bg-white/90 shadow-2xs backdrop-blur-md transition-all duration-200 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-zinc-950 hover:text-emerald-700 transition-colors cursor-pointer gap-4"
              >
                <span>{item.question}</span>
                <div
                  className={`h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 bg-emerald-100 text-emerald-700" : "text-zinc-500"
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm font-medium text-zinc-600 leading-relaxed border-t border-zinc-100 animate-in fade-in duration-150">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export const HOMEPAGE_FAQS: FaqItem[] = [
  {
    question: "What is Feedme?",
    answer:
      "Feedme transforms your standard bio link into an interactive vertical video reel experience (TikTok/Reels-style) that engages visitors and converts clicks into customers.",
  },
  {
    question: "How does the vertical video reel preview work?",
    answer:
      "You add video reel URLs or cloud links, and Feedme automatically formats them into a mobile-first, vertical video feed player with auto-looping and sound controls.",
  },
  {
    question: "Can I collect leads and contact details directly from my video feed?",
    answer:
      "Yes! The Growth Pro and Business plans include custom Lead Capture forms that send leads directly to your email, WhatsApp, or built-in Leads CRM manager.",
  },
  {
    question: "What are Video Promo Popups?",
    answer:
      "Video Promo Popups are customizable offer overlays (like discount deals or announcements) that appear directly over your video reels with dynamic display delay timers (0s, 3s, 5s, 10s).",
  },
  {
    question: "Do I need coding or technical skills to build my feed?",
    answer:
      "Not at all. Feedme is 100% no-code. You can configure your profile, social links, video reels, and promo popups in seconds using our intuitive creator studio.",
  },
  {
    question: "Will Feedme work on all mobile devices and social networks?",
    answer:
      "Yes! Feedme is fully optimized for iOS and Android web browsers and embeds seamlessly into bio link slots on Instagram, TikTok, YouTube, X (Twitter), and LinkedIn.",
  },
  {
    question: "Is there a free plan available?",
    answer:
      "Yes! We offer a free Starter plan so you can build your profile and test out core link-in-bio features with zero upfront commitment.",
  },
  {
    question: "Can I track my traffic and link clicks?",
    answer:
      "Absolutely. Personal, Pro, and Business plans include internal traffic analytics, click tracking, and video engagement rates, plus marketing pixel integrations (Meta, TikTok, Google) on Pro+.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply click 'Claim My Feed', register your unique username handle, and start configuring your video reel in less than 2 minutes!",
  },
];

export const PRICING_FAQS: FaqItem[] = [
  {
    question: "Is there a free trial for the Pro plan?",
    answer:
      "Yes! The Growth Pro plan includes a 7-day free trial so you can experience all premium features, including lead capture, CRM export, and marketing pixels.",
  },
  {
    question: "Can I change or upgrade my plan later?",
    answer:
      "Absolutely. You can upgrade, downgrade, or switch between monthly and annual billing cycles at any time from your Account Settings.",
  },
  {
    question: "What is the subscription cancellation policy?",
    answer:
      "You can cancel your subscription at any time with a single click from your account dashboard. For monthly plans, your access continues until the end of the current billing cycle. For annual plans, your access remains active for the full paid 12-month period with no automatic renewal.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, and PayPal through our secure 256-bit SSL encrypted billing gateway.",
  },
  {
    question: "What happens after my 7-day Pro trial ends?",
    answer:
      "At the end of your 7-day trial, your selected plan subscription will activate unless you cancel beforehand. You will always receive a reminder notice prior to billing.",
  },
  {
    question: "Can I use my own custom handle URL?",
    answer:
      "Yes! All accounts receive a clean, branded handle URL (e.g. feedm.ee/yourname) that you can place in your Instagram, TikTok, or YouTube bio.",
  },
  {
    question: "What is the difference between Personal, Pro, and Business plans?",
    answer:
      "Personal is ideal for creators who want clean vertical video feeds without lead capture. Growth Pro adds lead forms, CRM export, analytics, and marketing pixels. Business offers 5 feeds and multi-user seats for agencies.",
  },
  {
    question: "What are Extra Feed Add-ons?",
    answer:
      "Pro subscribers can purchase additional video feed handles under their single account for managing multiple client brands or secondary social profiles.",
  },
  {
    question: "Is my customer data and lead information secure?",
    answer:
      "Yes. All lead submissions and account data are encrypted in transit with 256-bit SSL and stored in secure cloud infrastructure with 2FA TOTP account protection.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We provide a 14-day money-back guarantee for all annual subscription purchases if you are not satisfied with your experience.",
  },
  {
    question: "How do I contact support if I need help?",
    answer:
      "You can reach our dedicated support team 24/7 via the in-app support tab or by emailing support@feedm.ee. Priority and dedicated support are available on Pro & Business plans.",
  },
];
