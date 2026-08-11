"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "./logo";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/pricing") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/pricing");
    }
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl transition-all duration-300">
      {/* Floating Glassmorphism Pill Container */}
      <div
        className={`relative h-14 w-full rounded-full border px-4 sm:px-6 flex items-center justify-between backdrop-blur-md backdrop-saturate-150 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 border-zinc-200/90 shadow-xl shadow-black/8"
            : "bg-white/80 border-zinc-200/70 shadow-lg shadow-black/5"
        }`}
      >
        {/* Left Side: Brand Logo */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link
            href="/pricing"
            className="text-[15px] font-semibold text-zinc-700 hover:text-zinc-950 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/demo"
            className="text-[15px] font-semibold text-zinc-700 hover:text-zinc-950 transition-colors"
          >
            Examples
          </Link>
          <Link
            href="/pricing"
            className="text-[15px] font-semibold text-zinc-700 hover:text-zinc-950 transition-colors"
          >
            Pricing
          </Link>
        </nav>

        {/* Right Side Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-[15px] font-semibold text-zinc-700 hover:text-zinc-950 transition-colors px-3 py-1.5"
          >
            Log in
          </Link>

          <button
            onClick={handleCtaClick}
            className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-full px-5 py-2.5 text-sm font-semibold shadow-md shadow-emerald-950/20 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100/80 text-zinc-800 hover:bg-zinc-200 transition-colors cursor-pointer"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile Glassmorphism Dropdown Menu */}
        {mobileOpen && (
          <div className="absolute top-16 left-0 right-0 z-50 rounded-3xl bg-white/95 backdrop-blur-xl border border-zinc-200/90 p-5 shadow-2xl shadow-black/10 animate-in fade-in slide-in-from-top-3 duration-200 text-left flex flex-col gap-3">
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="text-[15px] font-semibold text-zinc-800 hover:text-emerald-800 transition px-3 py-2 rounded-xl hover:bg-zinc-50"
            >
              Features
            </Link>
            <Link
              href="/demo"
              onClick={() => setMobileOpen(false)}
              className="text-[15px] font-semibold text-zinc-800 hover:text-emerald-800 transition px-3 py-2 rounded-xl hover:bg-zinc-50"
            >
              Examples
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="text-[15px] font-semibold text-zinc-800 hover:text-emerald-800 transition px-3 py-2 rounded-xl hover:bg-zinc-50"
            >
              Pricing
            </Link>
            <div className="my-1 border-t border-zinc-100" />
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-[15px] font-semibold text-zinc-800 hover:text-emerald-800 transition px-3 py-2 rounded-xl hover:bg-zinc-50"
            >
              Log in
            </Link>
            <button
              onClick={(e) => {
                setMobileOpen(false);
                handleCtaClick(e);
              }}
              className="w-full bg-emerald-900 hover:bg-emerald-800 text-white rounded-full py-3 text-sm font-semibold shadow-md shadow-emerald-950/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
