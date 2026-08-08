import React from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/80 bg-white/80 backdrop-blur-md py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Logo & Tagline */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/">
            <Logo />
          </Link>
          <p className="text-xs font-semibold text-zinc-500">
            The Interactive Link-in-Bio &amp; Video Feed Engine for Creators &amp; Brands.
          </p>
        </div>

        {/* Center/Right Side: Legal Links & Merchant of Record Notice */}
        <div className="flex flex-col md:flex-row items-center gap-6 text-xs font-bold text-zinc-600">
          <Link href="/terms-of-service" className="hover:text-emerald-600 transition-colors">
            Terms of Service
          </Link>
          <Link href="/terms-of-service" className="hover:text-emerald-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/pricing" className="hover:text-emerald-600 transition-colors">
            Pricing Plans
          </Link>
          <span className="text-[11px] text-zinc-400 font-medium border-l border-zinc-200 pl-4 hidden md:inline">
            Subscriptions billed by reseller Lemon Squeezy, LLC
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-zinc-100 text-center text-xs font-medium text-zinc-400">
        &copy; {new Date().getFullYear()} FeedM.ee SaaS. All rights reserved.
      </div>
    </footer>
  );
}
