"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/60 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
        
        {/* Left Side: Logo & Main Nav */}
        <div className="flex items-center">
          <Link href="/">
            <Logo />
          </Link>
          
          {/* Desktop Nav Links directly to the right */}
          <nav className="hidden md:flex items-center ml-8 gap-6">
            <Link href="/" className="text-sm font-bold text-zinc-600 hover:text-emerald-600 transition">
              Home
            </Link>
            <Link href="/pricing" className="text-sm font-bold text-zinc-600 hover:text-emerald-600 transition">
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right Side: Spacer to push actions to the right */}
        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-zinc-700 hover:text-emerald-600 transition px-2">
            Sign In
          </Link>
          <Link href="/signup">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-sm rounded-xl shadow-md transition duration-300">
              Get Started <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden ml-auto p-2 text-zinc-600"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200/60 bg-white">
          <div className="flex flex-col px-6 py-4 gap-4">
            <Link href="/" className="text-sm font-bold text-zinc-700" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link href="/pricing" className="text-sm font-bold text-zinc-700" onClick={() => setMobileOpen(false)}>
              Pricing
            </Link>
            <hr className="border-zinc-100" />
            <Link href="/login" className="text-sm font-bold text-zinc-700" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
