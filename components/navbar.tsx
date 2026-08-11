"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { Logo } from "./logo";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            className="text-xs font-extrabold text-zinc-700 hover:text-zinc-950 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/demo"
            className="text-xs font-extrabold text-zinc-700 hover:text-zinc-950 transition-colors"
          >
            Examples
          </Link>
          <Link
            href="/pricing"
            className="text-xs font-extrabold text-zinc-700 hover:text-zinc-950 transition-colors"
          >
            Pricing
          </Link>
        </nav>

        {/* Right Side Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-zinc-700 hover:text-zinc-950 transition-colors px-3 py-1.5"
          >
            Log in
          </Link>
          <Link href="/signup">
            <button className="rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black px-4 py-2 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-md">
              <span>Get Started Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
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
              className="text-xs font-bold text-zinc-800 hover:text-emerald-600 transition px-3 py-2 rounded-xl hover:bg-zinc-50"
            >
              Features
            </Link>
            <Link
              href="/demo"
              onClick={() => setMobileOpen(false)}
              className="text-xs font-bold text-zinc-800 hover:text-emerald-600 transition px-3 py-2 rounded-xl hover:bg-zinc-50"
            >
              Examples
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="text-xs font-bold text-zinc-800 hover:text-emerald-600 transition px-3 py-2 rounded-xl hover:bg-zinc-50"
            >
              Pricing
            </Link>
            <div className="my-1 border-t border-zinc-100" />
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-xs font-bold text-zinc-800 hover:text-emerald-600 transition px-3 py-2 rounded-xl hover:bg-zinc-50"
            >
              Log in
            </Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)}>
              <button className="w-full rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black py-3 shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer">
                <span>Get Started Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
