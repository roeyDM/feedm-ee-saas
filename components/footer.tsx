import React from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/80 bg-white/90 backdrop-blur-md py-12 px-6 mt-auto text-zinc-900 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Top Header Row: Logo & Merchant Reseller Notice */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 pb-8">
          <div className="flex flex-col gap-2">
            <Link href="/">
              <Logo />
            </Link>
            <p className="text-xs font-semibold text-zinc-500 max-w-md">
              The Interactive Link-in-Bio &amp; Video Feed Engine for Digital Creators, Influencers, and Visual Brands.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-200/80 px-3.5 py-2 text-[11px] font-bold text-zinc-600 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span>Encrypted Billing &amp; 256-Bit SSL <strong>Secure Checkout</strong></span>
          </div>
        </div>

        {/* 3-Column Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          
          {/* Column 3 (Left): Product */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black text-zinc-950 uppercase tracking-widest">Product</h4>
            <ul className="flex flex-col gap-2 text-xs font-semibold text-zinc-600">
              <li>
                <Link href="/features" className="hover:text-emerald-600 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/examples" className="hover:text-emerald-600 transition-colors">
                  Examples
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-600 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 (Center): Resources */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black text-zinc-950 uppercase tracking-widest">Resources</h4>
            <ul className="flex flex-col gap-2 text-xs font-semibold text-zinc-600">
              <li>
                <Link href="/help" className="hover:text-emerald-600 transition-colors font-extrabold text-emerald-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-600 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a href="mailto:support@feedm.ee" className="hover:text-emerald-600 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link href="#solutions" className="hover:text-emerald-600 transition-colors">
                  Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 1 (Right): Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black text-zinc-950 uppercase tracking-widest">Legal</h4>
            <ul className="flex flex-col gap-2 text-xs font-semibold text-zinc-600">
              <li>
                <Link href="/privacy" className="hover:text-emerald-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-emerald-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy#cookies" className="hover:text-emerald-600 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-400">
          <span>&copy; {new Date().getFullYear()} Feedme. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-zinc-600 transition-colors">Privacy</Link>
            <span>&bull;</span>
            <Link href="/terms-of-service" className="hover:text-zinc-600 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
