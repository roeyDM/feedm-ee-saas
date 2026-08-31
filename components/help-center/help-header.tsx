"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, LayoutDashboard, LogIn, Menu, X, ChevronRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { supabase } from "@/lib/supabase";
import { SupportModal } from "@/components/help-center/support-modal";

export function HelpHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch (err) {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  const handleOpenSupportModal = () => {
    setMobileMenuOpen(false);
    setIsSupportModalOpen(true);
  };

  return (
    <>
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Help Center Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link href="/" className="hover:opacity-80 transition-opacity shrink-0">
              <Logo />
            </Link>
            <span className="text-slate-300 font-bold">/</span>
            <Link
              href="/help"
              className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
            >
              Help Center
            </Link>
          </div>

          {/* Desktop Navigation (md:flex) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors"
              >
                <LogIn className="w-4 h-4 text-emerald-600" />
                <span>Login to Dashboard</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-colors shadow-xs cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Support</span>
            </button>
          </div>

          {/* Mobile Hamburger Icon Button (md:hidden) */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-900" />
              ) : (
                <Menu className="w-5 h-5 text-slate-900" />
              )}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu (md:hidden) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-150 z-50">
            <div className="px-4 py-4 space-y-3">
              
              {/* Dashboard / Auth Link */}
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-xs transition-colors hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                    <span>Go to Creator Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-xs transition-colors hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <LogIn className="w-4 h-4 text-emerald-600" />
                    <span>Login to Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              )}

              {/* Contact Support Action */}
              <button
                type="button"
                onClick={handleOpenSupportModal}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Support</span>
              </button>

            </div>
          </div>
        )}
      </header>
    </>
  );
}
