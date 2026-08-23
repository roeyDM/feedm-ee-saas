"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProfileEditor } from "@/components/profile-editor";
import { FeedItemEditor } from "@/components/feed-item-editor";
import { DesignEditor } from "@/components/design-editor";
import { BillingEditor } from "@/components/billing-editor";
import { AccountSettingsEditor } from "@/components/account-settings-editor";
import { Logo } from "@/components/logo";
import { LeadsManager } from "@/components/leads-manager";
import { AnalyticsManager } from "@/components/analytics-manager";
import { MarketingPixelsManager } from "@/components/marketing-pixels-manager";
import {
  MobilePreview,
  SocialLink,
  CustomLink,
  VideoReel,
  LeadFormSettings,
  AppearanceSettings,
  DEFAULT_APPEARANCE,
} from "@/components/mobile-preview";
import { sanitizeLeadForm, sanitizeHexColor } from "@/lib/sanitizers";
import { UpgradeModal } from "@/components/upgrade-modal";
import { ExtraFeedModal } from "@/components/extra-feed-modal";
import { Button } from "@/components/ui/button";
import { supabase, PlanType } from "@/lib/supabase";
import { checkAndApplyTrialDowngrade, getRemainingTrialDays } from "@/lib/auth-guards";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { User, Film, Palette, Sparkles, Smartphone, Save, CheckCircle2, AlertCircle, Lock, Zap, ArrowRight, ArrowLeft, Check, Share2, Eye, ChevronDown, ChevronRight, BarChart2, DollarSign, Settings, Layers, ExternalLink, Copy, RotateCcw, Undo2, Redo2, X, Loader2, Plus, Inbox, Target, Menu, LogOut, BarChart3, Link2, Sliders, LayoutTemplate, MousePointerClick, Pencil, Video, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function StripeCheckoutStatus({
  username,
  setPlanType,
  setSaveStatus,
  setStatusMsg,
}: {
  username: string;
  setPlanType: (plan: PlanType) => void;
  setSaveStatus: (status: "idle" | "success" | "error") => void;
  setStatusMsg: (msg: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const plan = searchParams.get("plan");

    if (checkout === "success" && plan && username) {
      // 1. Immediately unlock Pro locally
      setPlanType(plan as PlanType);
      
      // 2. Alert the user
      setSaveStatus("success");
      setStatusMsg(`Pro Features Unlocked! Welcome to the ${plan} plan.`);
      setTimeout(() => setSaveStatus("idle"), 5000);

      // 3. Update Supabase asynchronously
      const updatePlan = async () => {
        try {
          await supabase
            .from("profiles")
            .update({ plan_type: plan, updated_at: new Date().toISOString() })
            .eq("username", username.toLowerCase());
        } catch (err) {
          console.error("Failed to sync plan status to Supabase", err);
        }
      };
      
      updatePlan();
    }
  }, [searchParams, username, setPlanType, setSaveStatus, setStatusMsg]);

  return null;
}

function OnboardingWizardHeader({
  currentStep,
  isFreePlan = false,
  onStepClick,
  onSkip,
}: {
  currentStep: 1 | 2 | 3;
  isFreePlan?: boolean;
  onStepClick: (step: 1 | 2 | 3) => void;
  onSkip: () => void;
}) {
  const steps = [
    { number: 1, label: "Bio & Links", icon: Link2 },
    { number: 2, label: isFreePlan ? "Videos & Reels (Pro)" : "Videos & Reels", icon: Film },
    { number: 3, label: "Design & Themes", icon: Palette },
  ];

  const progressPercent = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 p-3 sm:p-4 text-white animate-in fade-in duration-300 shadow-md shrink-0">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left Title & Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                Setup Wizard <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/80">Step {currentStep} of {isFreePlan ? "2" : "3"}</span>
              </h2>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5 hidden sm:block">
                Follow these quick steps to launch your creator page.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="sm:hidden text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Skip</span>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Center Steps Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shrink-0 w-full sm:w-auto justify-center">
          {steps.map((s) => {
            const isActive = currentStep === s.number;
            const isDone = currentStep > s.number;
            const isSkippedStep = isFreePlan && s.number === 2;

            return (
              <button
                key={s.number}
                type="button"
                onClick={() => {
                  if (isSkippedStep) return;
                  onStepClick(s.number as 1 | 2 | 3);
                }}
                disabled={isSkippedStep}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer",
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : isDone
                    ? "text-emerald-400 hover:bg-slate-800"
                    : isSkippedStep
                    ? "text-slate-600 opacity-50 cursor-not-allowed"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                )}
              >
                <span className={cn(
                  "h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                  isActive
                    ? "bg-white text-emerald-950"
                    : isDone
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-400"
                )}>
                  {isDone ? <Check className="h-3 w-3" /> : s.number}
                </span>
                <span className="text-[11px] sm:text-xs">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action: Skip */}
        <button
          type="button"
          onClick={onSkip}
          className="hidden sm:flex text-xs font-bold text-slate-400 hover:text-white items-center gap-1 transition-colors shrink-0 cursor-pointer"
        >
          <span>Skip Wizard</span>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Track */}
      <div className="max-w-4xl mx-auto mt-2.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

function OnboardingWizardFooterNav({
  currentStep,
  isFreePlan = false,
  onNext,
  onBack,
  onFinish,
  onSkipStep,
}: {
  currentStep: 1 | 2 | 3;
  isFreePlan?: boolean;
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  onSkipStep: () => void;
}) {
  const stepLabel = currentStep === 1 ? "Bio & Links" : currentStep === 2 ? "Videos & Reels" : "Design & Themes";
  const nextLabel = currentStep === 1 ? (isFreePlan ? "Next: Design & Themes" : "Next: Videos & Reels") : "Next: Design & Themes";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300 max-w-[92vw]">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-white rounded-2xl shadow-2xl px-4 sm:px-5 py-3 flex items-center gap-3 sm:gap-5 text-xs font-medium">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-extrabold text-slate-200 hidden md:inline">
            Step {currentStep}: {stepLabel}
          </span>
          <button
            type="button"
            onClick={onSkipStep}
            className="text-slate-400 hover:text-slate-200 text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Skip this step</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 h-9 px-3 text-xs font-bold gap-1.5 cursor-pointer rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          )}

          {currentStep < 3 ? (
            <Button
              type="button"
              size="sm"
              onClick={onNext}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-9 px-4 text-xs shadow-md gap-1.5 cursor-pointer rounded-xl"
            >
              <span>{nextLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onFinish}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black h-9 px-4 sm:px-5 text-xs shadow-lg gap-1.5 cursor-pointer rounded-xl"
            >
              <Sparkles className="h-4 w-4 text-slate-950" />
              <span>Finish &amp; Publish Page</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReadinessData {
  hasAvatar: boolean;
  hasBio: boolean;
  hasLinks: boolean;
  hasReels: boolean;
  hasLeadEmail: boolean;
  score: number;
  is100Percent: boolean;
}

function PublishSuccessModal({
  open,
  onClose,
  username,
  readiness,
}: {
  open: boolean;
  onClose: () => void;
  username: string;
  readiness: ReadinessData;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899"],
        });
      } catch (e) {
        console.log("Confetti trigger error:", e);
      }
    }
  }, [open]);

  if (!open) return null;

  const publicUrl = `https://feedm.ee/${username || "main"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-zinc-200 max-w-md w-full p-6 shadow-2xl space-y-5 text-center animate-in zoom-in-95 duration-200 my-auto">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
          <Sparkles className="h-7 w-7 text-emerald-600" />
        </div>

        <div>
          <h3 className="text-xl font-black text-zinc-950 tracking-tight">Your Page is Live</h3>
          <p className="text-xs font-semibold text-zinc-500 mt-1">
            Congratulations! Your creator bio page is 100% complete and published.
          </p>
        </div>

        {/* 100% Readiness Badge */}
        <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 text-emerald-900 text-left text-xs space-y-1.5">
          <div className="flex items-center justify-between font-extrabold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Page Readiness ({readiness.score}/5 Completed)</span>
            </span>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full border bg-emerald-100 border-emerald-300 text-emerald-800">
              100% Ready
            </span>
          </div>
          <p className="text-[11px] font-medium text-emerald-800/90 pl-5">
            All profile criteria met: Avatar, bio, custom links, video reels, and lead notification email.
          </p>
        </div>

        {/* Public URL Box */}
        <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-zinc-800 truncate font-mono">
            {publicUrl}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-3 text-xs font-bold rounded-xl gap-1 shrink-0 bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-100 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-500" />
                <span>Copy Link</span>
              </>
            )}
          </Button>
        </div>

        {/* Action Buttons Container (Side-by-side flex layout) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Link href={`/${username}`} target="_blank" className="w-full sm:flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 text-xs font-extrabold rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 gap-1.5 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4 text-zinc-500 shrink-0" />
              <span className="truncate">View Live Feed</span>
            </Button>
          </Link>
          <Button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            <span className="truncate">Go to Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function DraftWarningModal({
  open,
  onClose,
  readiness,
  onNavigateToItem,
}: {
  open: boolean;
  onClose: () => void;
  username?: string;
  readiness: ReadinessData;
  onNavigateToItem?: (tab: "bio" | "reels" | "design" | "leads", targetId?: string) => void;
}) {
  if (!open) return null;

  const checklistItems = [
    { label: "Profile Picture / Avatar", isMet: readiness.hasAvatar, tab: "bio" as const, targetId: "avatar-upload-container" },
    { label: "Bio Description Text", isMet: readiness.hasBio, tab: "bio" as const, targetId: "bio" },
    { label: "At least 1 Active Custom Link", isMet: readiness.hasLinks, tab: "bio" as const, targetId: "custom-links-container" },
    { label: "At least 1 Video Reel (Pro)", isMet: readiness.hasReels, tab: "reels" as const, targetId: "reels-container" },
    { label: "Valid Lead Notification Email", isMet: readiness.hasLeadEmail, tab: "leads" as const, targetId: "lead-email-input" },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-zinc-200 max-w-md w-full p-6 shadow-2xl space-y-5 text-center animate-in zoom-in-95 duration-200 my-auto">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
          <AlertCircle className="h-7 w-7 text-amber-600" />
        </div>

        <div>
          <h3 className="text-xl font-black text-zinc-950 tracking-tight">Page Saved as Draft</h3>
          <p className="text-xs font-semibold text-zinc-500 mt-1">
            Your page is saved, but complete the 5 readiness items below for optimal visitor conversion.
          </p>
        </div>

        {/* 5-Criteria Readiness Checklist */}
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70 text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between font-extrabold border-b border-amber-200/80 pb-2">
            <span className="flex items-center gap-1.5 text-amber-900">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Readiness Score ({readiness.score}/5 Criteria Met)</span>
            </span>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full border bg-amber-100 border-amber-300 text-amber-800">
              Draft Status
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            {checklistItems.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToItem) {
                    onNavigateToItem(item.tab, item.targetId);
                  }
                }}
                className="w-full flex items-center justify-between text-[11px] font-semibold hover:bg-amber-100/60 p-1.5 rounded-xl transition-all cursor-pointer text-left group"
              >
                <span className="flex items-center gap-2 text-zinc-800">
                  {item.isMet ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  )}
                  <span className={item.isMet ? "text-zinc-700" : "text-amber-900 font-bold"}>
                    {item.label}
                  </span>
                </span>
                <span className={cn(
                  "text-[9px] font-black uppercase px-1.5 py-0.2 rounded border shrink-0",
                  item.isMet
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-amber-100 text-amber-800 border-amber-300 group-hover:bg-amber-200"
                )}>
                  {item.isMet ? "Complete" : "Tap to Fix"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Single Centered Full-Width Primary Action Button */}
        <div className="flex w-full justify-center">
          <Button
            type="button"
            onClick={onClose}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Continue Editing</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SidebarReadinessWidget({
  readiness,
  onNavigateToItem,
}: {
  readiness: ReadinessData;
  onNavigateToItem: (tab: "bio" | "reels" | "design" | "leads", targetId?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const percent = Math.round((readiness.score / 5) * 100);

  const checklistItems = [
    { label: "Profile Picture / Avatar", isMet: readiness.hasAvatar, tab: "bio" as const, targetId: "avatar-upload-container" },
    { label: "Bio Description Text", isMet: readiness.hasBio, tab: "bio" as const, targetId: "bio" },
    { label: "At least 1 Active Custom Link", isMet: readiness.hasLinks, tab: "bio" as const, targetId: "custom-links-container" },
    { label: "At least 1 Video Reel (Pro)", isMet: readiness.hasReels, tab: "reels" as const, targetId: "reels-container" },
    { label: "Valid Lead Notification Email", isMet: readiness.hasLeadEmail, tab: "leads" as const, targetId: "lead-email-input" },
  ];

  return (
    <div className="mt-2 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex flex-col gap-2 hover:bg-zinc-50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
            {readiness.is100Percent ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            )}
            <span>Page Readiness</span>
          </span>
          <span className={cn(
            "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
            readiness.is100Percent
              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
              : "bg-amber-100 text-amber-800 border-amber-300"
          )}>
            {readiness.is100Percent ? "LIVE" : "DRAFT"}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-zinc-500">
            <span>{readiness.score}/5 Criteria</span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                readiness.is100Percent ? "bg-emerald-500" : "bg-amber-500"
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </button>

      {/* Expanded Checklist View */}
      {expanded && (
        <div className="p-2 pt-0.5 border-t border-zinc-100 space-y-1 bg-zinc-50/50 animate-in fade-in duration-150">
          {checklistItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigateToItem(item.tab, item.targetId)}
              className="w-full flex items-center justify-between p-2 rounded-xl text-[11px] font-semibold hover:bg-white hover:shadow-2xs transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                {item.isMet ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                )}
                <span className={cn("truncate", item.isMet ? "text-zinc-600" : "text-amber-900 font-extrabold")}>
                  {item.label}
                </span>
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase px-1.5 py-0.2 rounded border shrink-0",
                item.isMet
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              )}>
                {item.isMet ? "Done" : "Edit"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileReadinessFloatingBadge({
  readiness,
  onClick,
}: {
  readiness: ReadinessData;
  onClick: () => void;
}) {
  const percent = Math.round((readiness.score / 5) * 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "md:hidden fixed top-3 right-16 z-40 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md border backdrop-blur-md transition-all cursor-pointer",
        readiness.is100Percent
          ? "bg-emerald-950/90 border-emerald-700/80 text-emerald-300"
          : "bg-amber-950/90 border-amber-700/80 text-amber-300"
      )}
    >
      {readiness.is100Percent ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
      )}
      <span>{readiness.is100Percent ? "Live" : "Draft"}: {percent}%</span>
    </button>
  );
}

function MobileReadinessSheet({
  open,
  onClose,
  readiness,
  onNavigateToItem,
}: {
  open: boolean;
  onClose: () => void;
  readiness: ReadinessData;
  onNavigateToItem: (tab: "bio" | "reels" | "design" | "leads", targetId?: string) => void;
}) {
  if (!open) return null;

  const percent = Math.round((readiness.score / 5) * 100);

  const checklistItems = [
    { label: "Profile Picture / Avatar", isMet: readiness.hasAvatar, tab: "bio" as const, targetId: "avatar-upload-container" },
    { label: "Bio Description Text", isMet: readiness.hasBio, tab: "bio" as const, targetId: "bio" },
    { label: "At least 1 Active Custom Link", isMet: readiness.hasLinks, tab: "bio" as const, targetId: "custom-links-container" },
    { label: "At least 1 Video Reel (Pro)", isMet: readiness.hasReels, tab: "reels" as const, targetId: "reels-container" },
    { label: "Valid Lead Notification Email", isMet: readiness.hasLeadEmail, tab: "leads" as const, targetId: "lead-email-input" },
  ];

  return (
    <div className="md:hidden fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl border-t border-zinc-200 w-full p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            {readiness.is100Percent ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600" />
            )}
            <h3 className="text-sm font-black text-zinc-950">Page Readiness ({readiness.score}/5 - {percent}%)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {checklistItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onClose();
                onNavigateToItem(item.tab, item.targetId);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 hover:bg-white text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {item.isMet ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                <span className={cn("text-xs font-bold truncate", item.isMet ? "text-zinc-700" : "text-amber-900 font-extrabold")}>
                  {item.label}
                </span>
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0",
                item.isMet
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              )}>
                {item.isMet ? "Complete" : "Tap to Fix"}
              </span>
            </button>
          ))}
        </div>

        <Button
          type="button"
          onClick={onClose}
          className="w-full h-11 bg-zinc-900 text-white font-extrabold text-xs rounded-xl cursor-pointer"
        >
          Close
        </Button>
      </div>
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"bio" | "reels" | "design" | "settings" | "leads" | "analytics" | "pixels">("bio");
  // Plan Tier State (default 'free', can be upgraded)
  const [planType, setPlanType] = useState<PlanType>("free");
  const [analyticsTier, setAnalyticsTier] = useState<"free" | "personal" | "pro">("free");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);
  const [mobileAccordions, setMobileAccordions] = useState<Record<string, boolean>>({
    myFeed: true,
    marketing: true,
  });

  const { getPlanLimit, canAccess } = useFeatureAccess(planType);
  const maxReels = getPlanLimit("reelsPerFeed");
  const hasLeadsCrmExport = canAccess("hasLeadsCrmExport");
  const hasMarketingPixels = canAccess("hasMarketingPixels");

  const handleTabClick = (tab: "bio" | "reels" | "design" | "settings" | "leads" | "analytics" | "pixels") => {
    if (tab === "reels" && maxReels === 0) {
      setShowUpgradeModal(true);
      return;
    }
    if (tab === "leads" && !hasLeadsCrmExport) {
      setShowUpgradeModal(true);
      return;
    }
    if (tab === "pixels" && !hasMarketingPixels) {
      setShowUpgradeModal(true);
      return;
    }
    setActiveTab(tab);
    setMobileDrawerOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Clean up any legacy offline dev mock plan overrides on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("feedmee_subscription_tier");
      localStorage.removeItem("feedmee_trial_active");
    }
  }, []);

  // Accordion Sidebar & Account Dropdown State
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    myFeed: true,
    analytics: false,
    monetization: false,
    settings: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Design Action Controls (Undo, Redo, Reset Default)
  const [designActions, setDesignActions] = useState<{
    reset?: () => void;
    undo?: () => void;
    redo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
  }>({});

  // Creator Profile Loading State (prevents flash of default mock data)
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Creator Profile State (default empty until session loads)
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [customHexColor, setCustomHexColor] = useState("#bad1cb");

  // Social Links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // Linktree Custom Links (Page 1)
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);

  // Video Reels (Pages 2–4)
  const [reels, setReels] = useState<VideoReel[]>([]);

  // Appearance Settings (Page 1 Design)
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);

  // Lead Form Settings (Page 5)
  const [leadForm, setLeadForm] = useState<LeadFormSettings>({
    title: "Get in Touch",
    subtitle: "Leave your details below and we'll get back to you shortly.",
    routeType: "email",
    target: "",
    phoneCountryCode: "1",
    phoneTarget: "",
    showWhatsappButton: true,
    showCallButton: false,
    is_phone_required: false,
    is_email_required: true,
  });

  // Supabase Persistence & Dirty State Tracking
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showExtraFeedModal, setShowExtraFeedModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // FTUE Onboarding Wizard State (Local Experiment)
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [showPublishSuccessModal, setShowPublishSuccessModal] = useState<boolean>(false);
  const [showDraftWarningModal, setShowDraftWarningModal] = useState<boolean>(false);
  const [mobileReadinessSheetOpen, setMobileReadinessSheetOpen] = useState<boolean>(false);

  const handleNavigateToItem = (tab: "bio" | "reels" | "design" | "leads", targetId?: string) => {
    setShowDraftWarningModal(false);
    setMobileReadinessSheetOpen(false);
    setActiveTab(tab);

    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId) || document.querySelector(`[name="${targetId}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          if ("focus" in el && typeof el.focus === "function") {
            (el as HTMLElement).focus();
          }
        }
      }, 150);
    }
  };

  const evaluateReadiness = (): ReadinessData => {
    const hasAvatar = !!avatarUrl && avatarUrl.trim().length > 0 && !avatarUrl.includes("unsplash.com");
    const hasBio = !!bio && bio.trim().length > 0;
    const validLinks = customLinks.filter((l: any) => l.title?.trim() && l.url?.trim());
    const hasLinks = validLinks.length >= 1;
    const validReels = reels.filter((r: any) => r.videoUrl || r.url);
    const hasReels = planType === "free" ? true : validReels.length >= 1;
    const hasLeadEmail = !!leadForm?.target && leadForm.target.trim().length > 0 && leadForm.target.includes("@");

    const score = (hasAvatar ? 1 : 0) + (hasBio ? 1 : 0) + (hasLinks ? 1 : 0) + (hasReels ? 1 : 0) + (hasLeadEmail ? 1 : 0);
    const is100Percent = score === 5;

    return {
      hasAvatar,
      hasBio,
      hasLinks,
      hasReels,
      hasLeadEmail,
      score,
      is100Percent,
    };
  };

  const handleWizardStepChange = async (step: 1 | 2 | 3) => {
    setWizardStep(step);
    if (step === 1) {
      setActiveTab("bio");
    } else if (step === 2) {
      setActiveTab("reels");
    } else if (step === 3) {
      setActiveTab("design");
    }

    const targetUsername = username.toLowerCase().trim();
    if (typeof window !== "undefined" && targetUsername) {
      localStorage.setItem(`feedmee_onboarding_step_${targetUsername}`, String(step));
    }
    try {
      if (targetUsername) {
        await supabase
          .from("profiles")
          .update({ onboarding_step: step, updated_at: new Date().toISOString() })
          .or(`username.eq.${targetUsername}`);
      }
    } catch (err) {
      console.warn("Failed to persist onboarding_step to Supabase profiles:", err);
    }
  };

  const markOnboardingCompletedInDB = async () => {
    setOnboardingCompleted(true);
    const targetUsername = username.toLowerCase().trim();
    if (typeof window !== "undefined" && targetUsername) {
      localStorage.setItem(`feedmee_onboarding_completed_${targetUsername}`, "true");
    }
    try {
      if (targetUsername) {
        await supabase
          .from("profiles")
          .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
          .or(`username.eq.${targetUsername}`);
      }
    } catch (err) {
      console.warn("Failed to persist onboarding_completed to Supabase profiles:", err);
    }
  };

  const handleSkipWizard = async () => {
    await markOnboardingCompletedInDB();
  };

  const handleSkipStep = async () => {
    if (wizardStep === 1) {
      if (planType === "free") {
        await handleWizardStepChange(3);
      } else {
        await handleWizardStepChange(2);
      }
    } else if (wizardStep === 2) {
      await handleWizardStepChange(3);
    } else if (wizardStep === 3) {
      await handleFinishAndPublish();
    }
  };

  const handleWizardNext = async () => {
    if (wizardStep === 1) {
      // Step 1 Validation: Bio text and at least 1 active link required
      const activeLinks = customLinks.filter((l: any) => l.title?.trim() && l.url?.trim());
      if (!bio || !bio.trim() || activeLinks.length < 1) {
        setSaveStatus("error");
        setStatusMsg("Please enter a bio and add at least 1 valid link before proceeding.");
        return;
      }

      // Free plan bypasses Step 2 (Videos & Reels) and goes directly to Step 3
      if (planType === "free") {
        await handleWizardStepChange(3);
      } else {
        await handleWizardStepChange(2);
      }
    } else if (wizardStep === 2) {
      // Step 2 Validation: Reels count >= 1 for non-free plans
      if (planType !== "free") {
        const activeReels = reels.filter((r: any) => r.videoUrl || r.url);
        if (activeReels.length < 1) {
          setSaveStatus("error");
          setStatusMsg("Please add at least 1 video reel before proceeding to Design & Themes.");
          return;
        }
      }
      await handleWizardStepChange(3);
    }
  };

  const handleWizardBack = async () => {
    if (wizardStep === 3) {
      if (planType === "free") {
        await handleWizardStepChange(1);
      } else {
        await handleWizardStepChange(2);
      }
    } else if (wizardStep === 2) {
      await handleWizardStepChange(1);
    }
  };

  const handleFinishAndPublish = async () => {
    await handleSave();
    await markOnboardingCompletedInDB();

    const readiness = evaluateReadiness();
    if (readiness.is100Percent) {
      setShowPublishSuccessModal(true);
    } else {
      setShowDraftWarningModal(true);
    }
  };

  // Serialize current state for dirty checking
  const getCurrentStateJSON = () => {
    return JSON.stringify({
      name,
      bio,
      avatarUrl,
      customHexColor,
      planType,
      socialLinks,
      customLinks,
      reels,
      leadForm,
      appearance,
    });
  };

  // ─── Load Authenticated User Profile on Mount ──────────────────────────────
  useEffect(() => {
    async function loadAuthUserSession() {
      setIsProfileLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsProfileLoading(false);
          return;
        }

        if (user.email) setUserEmail(user.email);
        const userHandle = (user.user_metadata?.username || user.user_metadata?.handle || user.email?.split("@")[0] || "").toLowerCase();
        const userName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || (userHandle ? userHandle.charAt(0).toUpperCase() + userHandle.slice(1) : "Creator");

        if (userHandle) setUsername(userHandle);
        if (userName) setName(userName);

        // Check for ?checkout=success parameter
        if (searchParams.get("checkout") === "success") {
          setSaveStatus("success");
          setStatusMsg("Subscription upgrade successful! Welcome to your upgraded creator workspace.");
          setTimeout(() => setSaveStatus("idle"), 6000);
        }

        // Pre-check URL search parameter for plan=pro or plan=personal and execute immediate awaited DB update BEFORE profile fetch
        const rawUrlPlan = (searchParams.get("plan") || "").toLowerCase();
        const isTrialRequestedFromUrl = rawUrlPlan === "pro" || rawUrlPlan === "personal";

        if (isTrialRequestedFromUrl) {
          const trialEndIso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          try {
            await supabase
              .from("profiles")
              .update({
                plan: rawUrlPlan,
                plan_type: rawUrlPlan,
                is_trial: true,
                trial_ends_at: trialEndIso,
                updated_at: new Date().toISOString(),
              })
              .or(`id.eq.${user.id},username.eq.${userHandle.toLowerCase()}`);
          } catch (_) {}

          setPlanType("pro");
        }

        // Fetch profile row from Supabase for authenticated user
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .or(`id.eq.${user.id},username.eq.${userHandle.toLowerCase()}`)
          .maybeSingle();

        if (profile && !error) {
          const checkedProfile = await checkAndApplyTrialDowngrade(profile);

          if (checkedProfile.name) setName(checkedProfile.name);
          if (checkedProfile.username) setUsername(checkedProfile.username);
          if (checkedProfile.bio !== undefined) setBio(checkedProfile.bio);
          if (checkedProfile.avatar_url !== undefined) setAvatarUrl(checkedProfile.avatar_url);
          if (checkedProfile.custom_hex_color) setCustomHexColor(checkedProfile.custom_hex_color);
          const createdAt = new Date(checkedProfile.created_at || user?.created_at || Date.now());
          const isWithin7Days = (Date.now() - createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000;
          const hasUsedTrial = checkedProfile.has_used_trial === true;

          // Trial is only valid if has_used_trial is not true AND is_trial !== false AND within 7 days
          const isTrialValid = !hasUsedTrial && checkedProfile.is_trial !== false && isWithin7Days;

          const dbPlanRaw = String(checkedProfile.plan_type || checkedProfile.plan || "").toLowerCase();
          const isPaidPro = dbPlanRaw.includes("pro") && checkedProfile.is_trial === false;
          const isProPlan = checkedProfile.is_super_admin === true || isPaidPro || isTrialValid || isTrialRequestedFromUrl;

          const isTrialExpired = !isProPlan && checkedProfile.is_super_admin !== true;

          if (isTrialExpired) {
            setPlanType("free");
            // Permanently mark trial as used in DB so user never receives another automated trial
            if (checkedProfile.is_trial !== false || checkedProfile.has_used_trial !== true) {
              supabase
                .from("profiles")
                .update({ plan: "free", plan_type: "free", is_trial: false, has_used_trial: true })
                .eq("id", checkedProfile.id)
                .then(() => {}, () => {});
            }

            const hasDismissed = typeof window !== "undefined" && sessionStorage.getItem("feedmee_trial_expired_dismissed") === "true";
            if (!hasDismissed) {
              setShowUpgradeModal(true);
            }
          } else if (isProPlan) {
            setPlanType("pro");
          } else {
            setPlanType("free");
          }
          setSubscriptionStatus(checkedProfile.subscription_status || "active");
          setTrialEndsAt(checkedProfile.trial_ends_at || null);
          if (profile.social_links) {
            setSocialLinks(profile.social_links.map((l: any) => ({
              ...l,
              id: l.id || crypto.randomUUID(),
              isActive: l.isActive !== false
            })));
          }
          if (profile.custom_links) setCustomLinks(profile.custom_links);
          if (profile.reels) {
            const cleanedReels = profile.reels
              .map((r: any) => ({
                ...r,
                videoUrl: r.videoUrl || r.url || "",
                promoUrl: r.promoUrl || r.promo_url || r.targetUrl || r.target_url || "",
                promoTitle: r.promoTitle || r.promo_title || "",
                promoCode: r.promoCode || r.promo_code || "",
                promoCta: r.promoCta || r.promo_cta || "Get Deal 🚀",
                promoEnabled: !!(r.promoEnabled || r.promo_enabled),
                promoDelaySeconds: typeof r.promoDelaySeconds === "number" ? r.promoDelaySeconds : (typeof r.promo_delay_seconds === "number" ? r.promo_delay_seconds : 3),
              }))
              .filter((r: any) => r.videoUrl && !r.videoUrl.includes("mixkit.co"));
            setReels(cleanedReels);
          }
          if (profile.lead_form) {
            let sanitized = sanitizeLeadForm(profile.lead_form);
            if ((!sanitized.target || !sanitized.target.trim()) && user?.email) {
              sanitized = { ...sanitized, target: user.email };
            }
            setLeadForm(sanitized);
          } else if (user?.email) {
            setLeadForm((prev) => ({ ...prev, target: user.email || "" }));
          }

          // Appearance Persistence with localStorage fallback
          let loadedAppearance = profile.appearance;
          if ((!loadedAppearance || Object.keys(loadedAppearance).length === 0) && typeof window !== "undefined") {
            const localApp = localStorage.getItem(`feedmee_appearance_${(profile.username || userHandle).toLowerCase()}`);
            if (localApp) {
              try { loadedAppearance = JSON.parse(localApp); } catch(e) {}
            }
          }
          if (loadedAppearance && Object.keys(loadedAppearance).length > 0) {
            setAppearance(loadedAppearance);
            if (loadedAppearance.bgColor) setCustomHexColor(loadedAppearance.bgColor);
          }

          // FTUE Onboarding Completed & Step check
          const isCompletedInDB = profile.onboarding_completed === true;
          const isCompletedInLocal = typeof window !== "undefined" && localStorage.getItem(`feedmee_onboarding_completed_${(profile.username || userHandle).toLowerCase()}`) === "true";
          const hasExistingContent = (profile.custom_links && profile.custom_links.length > 0) || (profile.reels && profile.reels.length > 0);

          if (isCompletedInDB || isCompletedInLocal || hasExistingContent) {
            setOnboardingCompleted(true);
          } else {
            setOnboardingCompleted(false);
            const savedStepDB = Number(profile.onboarding_step);
            const savedStepLocal = typeof window !== "undefined" ? Number(localStorage.getItem(`feedmee_onboarding_step_${(profile.username || userHandle).toLowerCase()}`)) : NaN;
            const restoredStep = (savedStepDB >= 1 && savedStepDB <= 3) ? savedStepDB : ((savedStepLocal >= 1 && savedStepLocal <= 3) ? savedStepLocal : 1);
            
            setWizardStep(restoredStep as 1 | 2 | 3);
            if (restoredStep === 1) setActiveTab("bio");
            else if (restoredStep === 2) setActiveTab("reels");
            else if (restoredStep === 3) setActiveTab("design");
          }

          setSavedSnapshot(JSON.stringify({
            name: profile.name || userName,
            bio: profile.bio || "",
            avatarUrl: profile.avatar_url || "",
            customHexColor: loadedAppearance?.bgColor || profile.custom_hex_color || "#bad1cb",
            planType: profile.plan_type || "free",
            socialLinks: profile.social_links || [],
            customLinks: profile.custom_links || [],
            reels: profile.reels || [],
            leadForm: sanitizeLeadForm(profile.lead_form) || leadForm,
            appearance: loadedAppearance || appearance,
          }));
        } else {
          setSavedSnapshot(getCurrentStateJSON());
        }
      } catch (err) {
        console.warn("User session load warning:", err);
        setSavedSnapshot(getCurrentStateJSON());
      } finally {
        setIsProfileLoading(false);
      }
    }
    loadAuthUserSession();
  }, [searchParams]);

  // Sync snapshot right after hydration completes to ensure no false-positive isDirty on refresh
  const isHydratedRef = useRef(false);
  useEffect(() => {
    if (!isProfileLoading && !isHydratedRef.current) {
      setSavedSnapshot(getCurrentStateJSON());
      isHydratedRef.current = true;
    }
  }, [isProfileLoading, name, bio, avatarUrl, customHexColor, planType, socialLinks, customLinks, reels, leadForm, appearance]);

  // Dirty State calculation & Browser Navigation Protection
  const isDirty = !isProfileLoading && savedSnapshot !== null && savedSnapshot !== getCurrentStateJSON();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleDiscardChanges = () => {
    if (!savedSnapshot) return;
    try {
      const parsed = JSON.parse(savedSnapshot);
      if (parsed.name !== undefined) setName(parsed.name);
      if (parsed.bio !== undefined) setBio(parsed.bio);
      if (parsed.avatarUrl !== undefined) setAvatarUrl(parsed.avatarUrl);
      if (parsed.customHexColor !== undefined) setCustomHexColor(parsed.customHexColor);
      if (parsed.planType !== undefined) setPlanType(parsed.planType);
      if (parsed.socialLinks !== undefined) setSocialLinks(parsed.socialLinks);
      if (parsed.customLinks !== undefined) setCustomLinks(parsed.customLinks);
      if (parsed.reels !== undefined) setReels(parsed.reels);
      if (parsed.leadForm !== undefined) setLeadForm(parsed.leadForm);
      if (parsed.appearance !== undefined) setAppearance(parsed.appearance);
    } catch (err) {
      console.error("Failed to discard changes", err);
    }
  };

  // Save changes to Supabase
  const handleSave = async () => {
    // Validation 1: Require at least 1 Custom Link
    const validCustomLinks = customLinks.filter(l => l.title?.trim() && l.url?.trim());
    if (validCustomLinks.length === 0) {
      setSaveStatus("error");
      setStatusMsg("Add at least 1 Custom Link to save your feed.");
      return;
    }

    // Validation 2: Check for empty URLs in active social links
    const hasEmptySocialLink = socialLinks.some(l => l.isActive !== false && (!l.url || !l.url.trim()));
    if (hasEmptySocialLink) {
      setSaveStatus("error");
      setStatusMsg("Please enter a valid link for all social links or remove empty ones before saving.");
      return;
    }

    // Validation 3: Check for target email in leadForm (ONLY when Lead Form is Enabled)
    const isLeadFormEnabled = leadForm.is_leadform_enabled !== false && leadForm.is_enabled !== false;
    if (isLeadFormEnabled && (!leadForm.target || !leadForm.target.trim() || !leadForm.target.includes("@"))) {
      setSaveStatus("error");
      setStatusMsg("Please enter a valid email address to receive lead notifications.");
      return;
    }

    setIsSaving(true);
    setSaveStatus("idle");
    setStatusMsg("");

    try {
      const cleanThemeColor = sanitizeHexColor(appearance?.bgColor || customHexColor, "#BAD1CB");
      const cleanButtonColor = sanitizeHexColor(appearance?.cardBgColor, "#16A34A");
      const cleanTextColor = sanitizeHexColor(appearance?.headlineColor, "#09090B");
      const cleanButtonTextColor = sanitizeHexColor(appearance?.cardTextColor, "#09090B");

      const sanitizedAppearance: any = appearance
        ? {
            ...appearance,
            bgColor: cleanThemeColor,
            bgGradientStart: sanitizeHexColor(appearance.bgGradientStart, "#FBCFE8"),
            bgGradientEnd: sanitizeHexColor(appearance.bgGradientEnd, "#E0F2FE"),
            headlineColor: cleanTextColor,
            bioColor: sanitizeHexColor(appearance.bioColor, "#27272A"),
            cardBgColor: cleanButtonColor,
            cardTextColor: cleanButtonTextColor,
            cardBorderColor: sanitizeHexColor(appearance.cardBorderColor, "#E4E4E7"),
            socialIconBgColor: sanitizeHexColor(appearance.socialIconBgColor, "#FFFFFF"),
            socialFlatColor: sanitizeHexColor(appearance.socialFlatColor, "#18181B"),
            avatarBorderColor: sanitizeHexColor(appearance.avatarBorderColor, "#FFFFFF"),
          }
        : {};

      let payload: any = {
        username: username.toLowerCase().trim(),
        name,
        bio,
        avatar_url: avatarUrl,
        custom_hex_color: cleanThemeColor,
        theme_color: cleanThemeColor,
        button_color: cleanButtonColor,
        text_color: cleanTextColor,
        button_text_color: cleanButtonTextColor,
        background_color: cleanThemeColor,
        background_gradient: appearance?.bgGradientStart && appearance?.bgGradientEnd ? `linear-gradient(${appearance?.bgGradientAngle ?? 135}deg, ${appearance.bgGradientStart}, ${appearance.bgGradientEnd})` : null,
        social_pill_color: sanitizeHexColor(appearance?.socialIconBgColor, cleanButtonColor),
        social_icon_mode: appearance?.socialLogoMode || "brand",
        background_gradient_angle: appearance?.bgGradientAngle ?? 135,
        background_image_url: appearance?.bgImageUrl || null,
        avatar_border_enabled: appearance?.avatarBorderEnabled !== false,
        avatar_border_color: sanitizeHexColor(appearance?.avatarBorderColor, "#FFFFFF"),
        avatar_border_width: appearance?.avatarBorderWidth ?? 4,
        font_family: appearance?.fontFamily || "Inter",
        bio_color: sanitizeHexColor(appearance?.bioColor, "#27272A"),
        button_shape: appearance?.buttonShape || "rounded",
        button_border_color: sanitizeHexColor(appearance?.cardBorderColor, "#E4E4E7"),
        social_flat_color: sanitizeHexColor(appearance?.socialFlatColor, "#18181B"),
        social_links: socialLinks,
        custom_links: customLinks,
        reels: reels,
        lead_form: leadForm,
        updated_at: new Date().toISOString(),
      };

      let { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "username" });

      if (error && (error.message?.includes("column") || error.details?.includes("column"))) {
        console.warn("One or more new design columns missing in profiles table, falling back to core payload...");
        const safePayload = {
          username: username.toLowerCase().trim(),
          name,
          bio,
          avatar_url: avatarUrl,
          custom_hex_color: cleanThemeColor,
          theme_color: cleanThemeColor,
          button_color: cleanButtonColor,
          text_color: cleanTextColor,
          button_text_color: cleanButtonTextColor,
          social_links: socialLinks,
          custom_links: customLinks,
          reels: reels,
          lead_form: leadForm,
          updated_at: new Date().toISOString(),
        };
        const fallbackRes = await supabase.from("profiles").upsert(safePayload, { onConflict: "username" });
        if (fallbackRes.error) {
          throw fallbackRes.error;
        }
      } else if (error) {
        throw error;
      }

      // Always store appearance in localStorage as immediate fallback
      if (typeof window !== "undefined") {
        localStorage.setItem(`feedmee_appearance_${username.toLowerCase().trim()}`, JSON.stringify(appearance));
      }

      setSaveStatus("success");
      setStatusMsg("Profile saved successfully!");
      setSavedSnapshot(getCurrentStateJSON());
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch (err: any) {
      console.error("Supabase Save Error Details:", err?.message || err?.details || JSON.stringify(err));
      setSaveStatus("error");
      setStatusMsg(err?.message || err?.details || "Failed to save profile to Supabase.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/${username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} on FeedM.ee`,
          url: profileUrl,
        });
      } catch (e) {
        console.log("Share cancelled", e);
      }
    } else {
      navigator.clipboard.writeText(profileUrl);
      setSaveStatus("success");
      setStatusMsg("Profile link copied to clipboard!");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const [showErrorToast, setShowErrorToast] = useState(false);

  useEffect(() => {
    if (saveStatus === "error") {
      setShowErrorToast(true);
      const timer = setTimeout(() => setShowErrorToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus, statusMsg]);

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-white items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 bg-zinc-900/90 border border-zinc-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl max-w-sm w-full text-center animate-in fade-in duration-300">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-white">Loading Creator Studio...</h3>
            <p className="text-xs text-zinc-400 font-medium">Fetching your custom profile &amp; themes</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden flex flex-col bg-zinc-50/80 font-sans text-zinc-900 relative">
      {/* Floating Error Toast Notification Overlay (Auto-dismisses after 4s) */}
      {showErrorToast && saveStatus === "error" && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-rose-950/95 text-white border border-rose-500/50 shadow-2xl px-5 py-3 backdrop-blur-md text-xs font-bold">
            <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
            <span>{statusMsg || "Validation error: Please fix highlighted fields."}</span>
            <button
              onClick={() => setShowErrorToast(false)}
              className="ml-2 text-rose-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP HEADER (Hidden on mobile) */}
      <div className="hidden md:block">
        <DashboardHeader
          username={username}
          planType={planType}
          subscriptionStatus={subscriptionStatus}
          trialEndsAt={trialEndsAt}
          onSave={handleSave}
          isSaving={isSaving}
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />
      </div>

      {/* MOBILE STICKY TOP BAR & DRAWER (Visible on mobile only) */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between block md:hidden">
        {/* Left Slot: Hamburger Button */}
        <div className="w-1/4 flex justify-start">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-200 hover:text-white border border-slate-700/80 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6 text-slate-200" />
          </button>
        </div>

        {/* Center Slot: Centered FeedM.ee Brand Logo */}
        <div className="w-2/4 flex justify-center items-center">
          <Link href="/dashboard" className="flex items-center justify-center">
            <Logo showText={false} />
          </Link>
        </div>

        {/* Right Slot: Plan Badge */}
        <div className="w-1/4 flex justify-end">
          {planType === "pro" ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase shrink-0">
              <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">PRO TRIAL ACTIVE</span>
              <span className="sm:hidden">PRO</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase shrink-0 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>FREE</span>
            </button>
          )}
        </div>
      </header>

      {/* MOBILE HAMBURGER DRAWER OVERLAY (SLIDING FROM LEFT) */}
      {mobileDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-start block md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div 
            className="w-80 max-w-[85vw] bg-slate-900 h-full border-r border-slate-800 p-4 pb-28 pt-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              
              {/* DRAWER TOP BAR WITH LOGO BRANDING & CLOSE BUTTON */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <Link href="/dashboard" onClick={() => setMobileDrawerOpen(false)} className="flex items-center">
                  <Logo showText={true} wordmarkClassName="text-base text-white" />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* TOP OF DRAWER: USER PROFILE CARD (1:1 Desktop Parity) */}
              <div className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700/80 shadow-sm flex items-center justify-between min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"}
                    alt={name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-black text-white truncate">{name || "User"}</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase shrink-0">
                        {planType}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 truncate font-medium">@{username || "username"}</span>
                  </div>
                </div>
              </div>

              {/* ACCURATE MOBILE DRAWER NAVIGATION STRUCTURE (1:1 DESKTOP PARITY) */}
              <nav className="flex flex-col gap-2.5">
                
                {/* 1. MY FEED (Collapsible Group) */}
                <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/60 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setMobileAccordions(prev => ({ ...prev, myFeed: !prev.myFeed }))}
                    className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-white hover:bg-slate-800/60 transition-colors text-left select-none cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="h-4 w-4 text-emerald-400" />
                      <span>MY FEED</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", mobileAccordions.myFeed && "rotate-180")} />
                  </button>

                  {mobileAccordions.myFeed && (
                    <div className="flex flex-col gap-1 p-2 pt-0.5 border-t border-slate-800/80 animate-in fade-in duration-200">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("bio");
                          setMobileDrawerOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                          activeTab === "bio" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <User className="h-4 w-4 text-emerald-400" />
                        <span>Bio &amp; Links</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTabClick("reels")}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                          activeTab === "reels" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <Film className="h-4 w-4 text-emerald-400" />
                        <span>Videos &amp; Reels</span>
                        {maxReels === 0 && <Lock className="h-3 w-3 text-amber-400 ml-auto" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTabClick("design")}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                          activeTab === "design" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <Palette className="h-4 w-4 text-emerald-400" />
                        <span>Design &amp; Themes</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. ANALYTICS / INSIGHTS (Direct Category) */}
                <button
                  type="button"
                  onClick={() => handleTabClick("analytics")}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-3 rounded-2xl border text-xs font-black transition-all text-left cursor-pointer",
                    activeTab === "analytics"
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "bg-slate-950/60 border-slate-800 text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                    <span>ANALYTICS / INSIGHTS</span>
                  </div>
                  <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">
                    Active
                  </span>
                </button>

                {/* 3. MARKETING TOOLS (Collapsible Group) */}
                <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/60 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setMobileAccordions(prev => ({ ...prev, marketing: !prev.marketing }))}
                    className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-white hover:bg-slate-800/60 transition-colors text-left select-none cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Target className="h-4 w-4 text-emerald-400" />
                      <span>MARKETING TOOLS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">Active</span>
                      <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", mobileAccordions.marketing && "rotate-180")} />
                    </div>
                  </button>

                  {mobileAccordions.marketing && (
                    <div className="flex flex-col gap-1 p-2 pt-0.5 border-t border-slate-800/80 animate-in fade-in duration-200">
                      <button
                        type="button"
                        onClick={() => handleTabClick("leads")}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                          activeTab === "leads"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Inbox className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span>Leads CRM</span>
                        </div>
                        {!hasLeadsCrmExport ? (
                          <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">
                            New
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTabClick("pixels")}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                          activeTab === "pixels"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span>Marketing Pixels</span>
                        </div>
                        {!hasMarketingPixels ? (
                          <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">
                            New
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </nav>
            </div>

            {/* BOTTOM ACCOUNT ACTIONS IN DRAWER */}
            <div className="pt-4 border-t border-slate-800 space-y-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("settings");
                  setMobileDrawerOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left w-full cursor-pointer",
                  activeTab === "settings" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </button>

              <button 
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  if (typeof window !== "undefined") window.location.href = "/login";
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm mt-4 border border-red-500/20 mb-8 cursor-pointer"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                <span>Log Out</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CORE SECTION SWITCHER (SUB-HEADER) - Visible ONLY inside Main Builder */}
      {(activeTab === "bio" || activeTab === "reels" || activeTab === "design") && (
        <div className="sticky top-[57px] z-30 bg-slate-900 border-b border-slate-800 px-3 py-2 block md:hidden">
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("bio")}
              className={cn(
                "py-2 px-1 text-[11px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer",
                activeTab === "bio"
                  ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <User className="w-3.5 h-3.5" />
              <span>Bio &amp; Links</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reels")}
              className={cn(
                "py-2 px-1 text-[11px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer",
                activeTab === "reels"
                  ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos &amp; Reels</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("design")}
              className={cn(
                "py-2 px-1 text-[11px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer",
                activeTab === "design"
                  ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Design &amp; Themes</span>
            </button>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <StripeCheckoutStatus 
          username={username}
          setPlanType={setPlanType}
          setSaveStatus={setSaveStatus}
          setStatusMsg={setStatusMsg}
        />
      </Suspense>



      <main className="flex-1 w-full flex flex-col lg:flex-row items-start overflow-hidden min-h-0">
        
        {/* LEFT SIDEBAR (Desktop only) */}
        <aside className="w-full lg:w-[280px] shrink-0 h-full flex flex-col gap-4 overflow-y-auto border-r border-zinc-200 bg-zinc-100/80 px-4 py-5 lg:px-5 pb-8 hidden lg:flex">
          {/* Consolidated Profile & Feed Switcher */}
          <div className="relative">
            <div 
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="bg-white rounded-2xl p-3 border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all flex items-center justify-between cursor-pointer group select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"}
                  alt={name}
                  className="w-9 h-9 rounded-full object-cover border border-zinc-200 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-black text-zinc-900 truncate">{name}</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200/80 uppercase shrink-0">
                      {planType}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 truncate font-medium">@{username}</span>
                </div>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-zinc-400 group-hover:text-zinc-700 transition-transform duration-200 shrink-0", accountMenuOpen && "rotate-180")} />
            </div>

            {/* Account Switcher Dropdown Menu */}
            {accountMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-zinc-200 shadow-xl z-30 p-2 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">MY FEEDS</div>
                
                {/* Active Primary Feed Item */}
                <button 
                  onClick={() => setAccountMenuOpen(false)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-emerald-50 text-emerald-950 font-bold text-xs border border-emerald-200/50 transition-colors min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                    <img
                      src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover border border-emerald-300 shrink-0"
                    />
                    <span className="truncate text-xs font-bold text-emerald-950">@{username || "username"}</span>
                  </div>
                  <span className="text-[9px] text-emerald-700 font-black uppercase shrink-0 ml-1.5 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-200">Active</span>
                </button>

                {/* Add More Feeds Option */}
                <button 
                  onClick={() => {
                    setShowExtraFeedModal(true);
                    setAccountMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 text-xs font-semibold mt-1 transition-colors cursor-pointer min-w-0 group"
                >
                  <Plus className="h-3.5 w-3.5 text-zinc-400 group-hover:text-emerald-600 shrink-0" />
                  <span className="truncate text-left text-xs font-bold text-zinc-700 group-hover:text-zinc-900">
                    Add More Feeds
                  </span>
                </button>

                {/* Compact Mini Upgrade Badge CTA */}
                <button 
                  onClick={() => {
                    setShowUpgradeModal(true);
                    setAccountMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-950 via-zinc-900 to-teal-950 text-white border border-emerald-500/40 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer group text-left mt-1"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Zap className="h-3 w-3 text-emerald-400 fill-current shrink-0 animate-pulse" />
                    <span className="text-[10px] font-extrabold text-white truncate">Upgrade to Business</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                {/* Single Divider Line separating MY FEEDS from Settings */}
                <div className="my-2 border-t border-zinc-100"></div>

                <button 
                  onClick={() => {
                    setActiveTab("settings");
                    setAccountMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 hover:bg-zinc-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Account Settings</span>
                </button>

                <button 
                  onClick={() => { handleShareProfile(); setAccountMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 hover:bg-zinc-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Share Profile Link</span>
                </button>

                <button 
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    if (typeof window !== "undefined") window.location.href = "/login";
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs border border-red-200/60 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-500" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Collapsible Accordion Navigation Menu */}
          <div className="flex flex-col gap-2.5">
            {/* Accordion 1: My Feed */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-zinc-200/90 bg-white shadow-2xs transition-all">
              <button
                onClick={() => toggleAccordion("myFeed")}
                className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-zinc-900 hover:bg-zinc-50 transition-colors text-left select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  <span>My Feed</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", openAccordions.myFeed && "rotate-180")} />
              </button>

              {openAccordions.myFeed && (
                <div className="flex flex-col gap-1 p-2 pt-0.5 border-t border-zinc-100/90 animate-in fade-in duration-200">
                  <button
                    onClick={() => handleTabClick("bio")}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left",
                      activeTab === "bio"
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
                    )}
                  >
                    <User className="h-4 w-4 shrink-0" />
                    <span>Bio &amp; Links</span>
                  </button>

                  <button
                    onClick={() => handleTabClick("reels")}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left relative",
                      activeTab === "reels"
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
                    )}
                  >
                    <Film className="h-4 w-4 shrink-0" />
                    <span>Videos &amp; Reels</span>
                    {maxReels === 0 && (
                      <Lock className={cn("h-3.5 w-3.5 ml-auto", activeTab === "reels" ? "text-amber-400" : "text-amber-500")} />
                    )}
                  </button>

                  <button
                    onClick={() => handleTabClick("design")}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left",
                      activeTab === "design"
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
                    )}
                  >
                    <Palette className="h-4 w-4 shrink-0" />
                    <span>Design &amp; Themes</span>
                  </button>
                </div>
              )}
            </div>

            {/* Top-Level Menu: Analytics & Insights (Flattened) */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-zinc-200/90 bg-white shadow-2xs transition-all">
              <button
                onClick={() => handleTabClick("analytics")}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-3 text-xs font-black transition-all text-left select-none cursor-pointer",
                  activeTab === "analytics"
                    ? "bg-zinc-950 text-white shadow-sm"
                    : "text-zinc-900 hover:bg-zinc-50"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className={cn("h-4 w-4", activeTab === "analytics" ? "text-emerald-400" : "text-emerald-600")} />
                  <span>Analytics / Insights</span>
                </div>
                <span className={cn(
                  "text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase",
                  activeTab === "analytics"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-emerald-100 text-emerald-800 border-emerald-200"
                )}>
                  Active
                </span>
              </button>
            </div>

            {/* Accordion 3: Monetization */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-zinc-200/90 bg-white shadow-2xs transition-all">
              <button
                onClick={() => toggleAccordion("monetization")}
                className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-zinc-900 hover:bg-zinc-50 transition-colors text-left select-none"
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="h-4 w-4 text-zinc-500" />
                  <span>Monetization</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-200">SOON</span>
                  <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", openAccordions.monetization && "rotate-180")} />
                </div>
              </button>

              {openAccordions.monetization && (
                <div className="flex flex-col gap-1 p-2 pt-0.5 border-t border-zinc-100/90 animate-in fade-in duration-200">
                  <button disabled className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 cursor-not-allowed text-left">
                    <span>Lead Capture Form</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Active</span>
                  </button>
                  <button disabled className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 cursor-not-allowed text-left">
                    <span>Digital Store</span>
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 4: Marketing Tools */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-zinc-200/90 bg-white shadow-2xs transition-all">
              <button
                onClick={() => toggleAccordion("settings")}
                className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-zinc-900 hover:bg-zinc-50 transition-colors text-left select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-emerald-600" />
                  <span>Marketing Tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">Active</span>
                  <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", openAccordions.settings && "rotate-180")} />
                </div>
              </button>

              {openAccordions.settings && (
                <div className="flex flex-col gap-1 p-2 pt-0.5 border-t border-zinc-100/90 animate-in fade-in duration-200">
                  <button
                    onClick={() => handleTabClick("leads")}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                      activeTab === "leads"
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-900"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Inbox className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>Leads CRM</span>
                    </div>
                    {!hasLeadsCrmExport ? (
                      <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
                        New
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleTabClick("pixels")}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                      activeTab === "pixels"
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-900"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>Marketing Pixels</span>
                    </div>
                    {!hasMarketingPixels ? (
                      <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
                        New
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Sidebar Readiness Widget (Phase B) */}
            <SidebarReadinessWidget
              readiness={evaluateReadiness()}
              onNavigateToItem={handleNavigateToItem}
            />
          </div>
        </aside>

        {/* Mobile Floating Readiness Badge (Phase B) */}
        <MobileReadinessFloatingBadge
          readiness={evaluateReadiness()}
          onClick={() => setMobileReadinessSheetOpen(true)}
        />

        {/* CENTER WORKSPACE */}
        <div className={cn("min-w-0 flex flex-col w-full flex-1 h-full overflow-y-auto p-4 md:p-6", activeTab === "settings" ? "p-0 m-0 border-0" : "gap-6")}>
          {/* FTUE Onboarding Wizard Progress Banner (Local Experiment) */}
          {!onboardingCompleted && (
            <OnboardingWizardHeader
              currentStep={wizardStep}
              isFreePlan={planType === "free"}
              onStepClick={handleWizardStepChange}
              onSkip={handleSkipWizard}
            />
          )}

          {/* Status Notification Toast Banner - Only shown on editing tabs (Bio, Reels, Design) */}
          {saveStatus !== "idle" && (activeTab === "bio" || activeTab === "reels" || activeTab === "design") && (
            <div
              className={`flex items-center justify-between rounded-2xl p-4 text-xs font-bold shadow-md transition-all ${
                saveStatus === "success"
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                {saveStatus === "success" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span>{statusMsg}</span>
              </div>
              <button
                onClick={() => setSaveStatus("idle")}
                className="text-white/80 hover:text-white underline text-[11px]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Plan Status Banner (Free Tier vs. Pro Trial) */}
          {activeTab !== "settings" && (
            planType === "free" ? (
              <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-emerald-500/10 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 shadow-md">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      Free Tier Mode <span className="text-[10px] normal-case font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">Limited Access</span>
                    </h2>
                    <p className="text-xs font-semibold text-zinc-600 mt-0.5">
                      Page 1 (Bio &amp; Links) is active. Upgrade to Pro ($7/mo) to unlock Video Reels (Pages 2–4), Lead Form (Page 5), and White-Label Branding.
                    </p>
                  </div>
                </div>

              </div>
            ) : null
          )}

          {(activeTab === "bio" || activeTab === "reels" || activeTab === "design") && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm max-w-3xl mx-auto w-full">
              <div>
                <h1 className="text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
                  Creator Studio <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
                </h1>
                <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                  Customize your profile, video reels, and design settings.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeTab === "design" && designActions.reset && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={designActions.reset}
                      className="text-xs font-bold text-zinc-700 hover:bg-zinc-100 border-zinc-200 h-10 px-3 rounded-xl shadow-2xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-zinc-500" /> Reset Default
                    </Button>

                    <div className="flex items-center gap-1 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200 h-10">
                      <button
                        onClick={designActions.undo}
                        disabled={!designActions.canUndo}
                        title="Undo"
                        className="p-1 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                      >
                        <Undo2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={designActions.redo}
                        disabled={!designActions.canRedo}
                        title="Redo"
                        className="p-1 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                      >
                        <Redo2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 gap-1.5 shadow-sm rounded-xl"
                >
                  <Save className="h-4 w-4" /> Save Profile
                </Button>
              </div>
            </div>
          )}

          {/* Active Form Panel */}
          {activeTab !== "settings" ? (
            <div className={cn("relative w-full space-y-6 transition-all duration-300 pb-32", activeTab === "leads" || activeTab === "analytics" ? "max-w-none w-full flex-1" : "max-w-3xl mx-auto")}>
              {activeTab === "bio" && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <ProfileEditor
                    name={name}
                    setName={setName}
                    username={username}
                    setUsername={setUsername}
                    bio={bio}
                    setBio={setBio}
                    avatarUrl={avatarUrl}
                    setAvatarUrl={setAvatarUrl}
                    customHexColor={customHexColor}
                    setCustomHexColor={setCustomHexColor}
                    socialLinks={socialLinks}
                    setSocialLinks={setSocialLinks}
                    customLinks={customLinks}
                    setCustomLinks={setCustomLinks}
                    leadForm={leadForm}
                    setLeadForm={setLeadForm}
                    planType={planType}
                  />
                </div>
              )}

              {activeTab === "reels" && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <FeedItemEditor 
                    reels={reels} 
                    setReels={setReels} 
                    planType={planType} 
                    setPlanType={setPlanType}
                    leadForm={leadForm}
                    setLeadForm={setLeadForm}
                  />
                </div>
              )}

              {activeTab === "design" && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <DesignEditor 
                    customHexColor={customHexColor}
                    setCustomHexColor={setCustomHexColor}
                    appearance={appearance}
                    setAppearance={setAppearance}
                    planType={planType}
                    onRegisterActions={setDesignActions}
                  />
                </div>
              )}

              {activeTab === "leads" && (
                <div className="animate-in fade-in zoom-in-95 duration-200 w-full max-w-none flex-1">
                  <LeadsManager username={username} targetEmail={leadForm.target} />
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="animate-in fade-in zoom-in-95 duration-200 w-full max-w-none flex-1">
                  <AnalyticsManager 
                    planType={planType} 
                    activeTier={analyticsTier}
                    onTierChange={setAnalyticsTier}
                    username={username}
                  />
                </div>
              )}

              {activeTab === "pixels" && (
                <div className="animate-in fade-in zoom-in-95 duration-200 w-full max-w-none flex-1">
                  <MarketingPixelsManager username={username} />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex-1 animate-in fade-in duration-200 pb-32">
              <AccountSettingsEditor
                name={name}
                setName={setName}
                username={username}
                setUsername={setUsername}
                bio={bio}
                setBio={setBio}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
                planType={planType}
                setPlanType={setPlanType}
                socialLinks={socialLinks}
                customLinks={customLinks}
                reels={reels}
                leadForm={leadForm}
              />
            </div>
          )}
        </div>

        {/* RIGHT PANEL: MOBILE PREVIEW (Desktop only, hidden on mobile) */}
        {activeTab !== "settings" && (
          <aside className="w-[360px] lg:w-[380px] xl:w-[410px] h-full shrink-0 border-l border-zinc-200/80 flex flex-col items-center justify-center p-4 bg-white overflow-hidden hidden lg:flex">
            <div className="text-center w-full flex justify-center mb-1">
              <Link href={`/${username}`} target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-white border border-zinc-200/80 shadow-sm px-4 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors gap-1.5 h-auto"
                >
                  <Eye className="h-4 w-4 text-emerald-600" /> View Live Preview
                </Button>
              </Link>
            </div>

            <div className="w-full flex justify-center overflow-visible">
              <MobilePreview
              profileName={name}
              username={username}
              bio={bio}
              avatarUrl={avatarUrl}
              customHexColor={customHexColor}
              socialLinks={socialLinks}
              customLinks={customLinks}
              reels={reels}
              leadForm={leadForm}
              appearance={appearance}
              fontFamily={appearance?.fontFamily}
              isDemoMode={true}
              activeTab={activeTab}
              analyticsOverlayMode={
                activeTab === "analytics"
                  ? analyticsTier === "free"
                    ? "bubbles"
                    : analyticsTier === "personal"
                    ? "reels"
                    : "heatmap"
                  : null
              }
              onTestLeadSubmit={async (targetEmail, leadData) => {
                try {
                  const res = await fetch("/api/send-lead-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      targetEmail,
                      name: leadData.name,
                      email: leadData.email,
                      phone: leadData.phone,
                      feedHandle: username || name || "main",
                      is_test: true,
                      isTest: true,
                      source: "simulator",
                    }),
                  });

                  const data = await res.json();
                  if (res.ok && data.success && !data.warning) {
                    setSaveStatus("success");
                    setStatusMsg(`✅ Lead saved & email notification sent!`);
                  } else {
                    console.error("[Email Error]:", data.error || data.warning || data);
                    setSaveStatus("error");
                    setStatusMsg(data.warning || `⚠️ Lead saved to DB, but email delivery failed. Please check RESEND_API_KEY.`);
                  }
                } catch (err: any) {
                  console.error("[Email Error]:", err);
                  setSaveStatus("error");
                  setStatusMsg(`⚠️ Lead saved to DB, but email delivery failed. Please check RESEND_API_KEY.`);
                } finally {
                  setTimeout(() => setSaveStatus("idle"), 6500);
                }
              }}
            />
            </div>
          </aside>
        )}
      </main>

      {/* DYNAMIC CONTEXTUAL BOTTOM TOOLBAR (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl block md:hidden">
        {activeTab === "bio" && (
          <>
            <button
              type="button"
              onClick={() => scrollToSection("profile-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("links-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <Link2 className="w-4 h-4 text-emerald-400" />
              <span>Links</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("socials-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Socials</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMobilePreviewModal(true)}
              className="flex flex-col items-center gap-1 text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 px-2 py-1 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Preview</span>
            </button>
          </>
        )}

        {activeTab === "reels" && (
          <>
            <button
              type="button"
              onClick={() => scrollToSection("reels-list-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4 text-emerald-400" />
              <span>My Reels</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("add-reel-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Reel</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("reel-settings-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMobilePreviewModal(true)}
              className="flex flex-col items-center gap-1 text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 px-2 py-1 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Preview</span>
            </button>
          </>
        )}

        {activeTab === "design" && (
          <>
            <button
              type="button"
              onClick={() => scrollToSection("preset-themes-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <LayoutTemplate className="w-4 h-4 text-emerald-400" />
              <span>Themes</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("color-picker-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <Palette className="w-4 h-4 text-emerald-400" />
              <span>Colors</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("button-style-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <MousePointerClick className="w-4 h-4 text-emerald-400" />
              <span>Buttons</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMobilePreviewModal(true)}
              className="flex flex-col items-center gap-1 text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 px-2 py-1 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Preview</span>
            </button>
          </>
        )}

        {(activeTab === "analytics" || activeTab === "leads" || activeTab === "pixels" || activeTab === "settings") && (
          <>
            <button
              type="button"
              onClick={() => handleTabClick("bio")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-5 h-5 text-slate-300" />
              <span>MY FEED</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick("analytics")}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-bold px-2 py-1 transition-colors cursor-pointer",
                activeTab === "analytics" ? "text-emerald-400 font-extrabold" : "text-slate-300 hover:text-emerald-400"
              )}
            >
              <BarChart3 className={cn("w-5 h-5", activeTab === "analytics" ? "text-emerald-400" : "text-slate-300")} />
              <span>ANALYTICS</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick("leads")}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-bold px-2 py-1 transition-colors cursor-pointer",
                activeTab === "leads" ? "text-emerald-400 font-extrabold" : "text-slate-300 hover:text-emerald-400"
              )}
            >
              <Users className={cn("w-5 h-5", activeTab === "leads" ? "text-emerald-400" : "text-slate-300")} />
              <span>CRM</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMobilePreviewModal(true)}
              className="flex flex-col items-center gap-1 text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 px-2 py-1 transition-colors cursor-pointer"
            >
              <Eye className="w-5 h-5 text-emerald-400" />
              <span>LIVE PREVIEW</span>
            </button>
          </>
        )}
      </nav>

      {/* FULL-SCREEN MOBILE LIVE PREVIEW OVERLAY */}
      {showMobilePreviewModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-3 h-[100dvh] overflow-y-auto block md:hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full h-full max-w-[390px] mx-auto flex items-center justify-center">
            <MobilePreview
              profileName={name}
              username={username}
              bio={bio}
              avatarUrl={avatarUrl}
              customHexColor={customHexColor}
              socialLinks={socialLinks}
              customLinks={customLinks}
              reels={reels}
              leadForm={leadForm}
              appearance={appearance}
              fontFamily={appearance?.fontFamily}
              isDemoMode={true}
              activeTab={activeTab}
            />
          </div>

          <Button
            type="button"
            onClick={() => setShowMobilePreviewModal(false)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white font-extrabold text-xs h-11 px-6 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer hover:bg-slate-800"
          >
            <Pencil className="w-4 h-4 text-emerald-400" />
            <span>Back to Editor</span>
          </Button>
        </div>
      )}

      {/* Floating Unsaved Changes Reminder Toast Bar - STRICTLY SCOPED to Builder Tabs (Bio, Reels, Design) */}
      {isDirty && (activeTab === "bio" || activeTab === "reels" || activeTab === "design") && (
        <>
          {/* Mobile Compact Single-Line Strip */}
          <div className="fixed bottom-16 left-4 right-4 z-[90] bg-slate-900/95 border border-slate-700 p-2.5 rounded-full flex items-center justify-between shadow-2xl backdrop-blur-md block md:hidden animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-1.5 pl-1.5 min-w-0">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
              <span className="text-xs font-extrabold text-white truncate">Unsaved changes</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600/80 rounded-full transition-colors cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-3.5 py-1 text-[11px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-sm transition-colors cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Desktop Floating Toast Bar (Shown when wizard is completed and user has unsaved changes) */}
          {onboardingCompleted && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300 hidden md:block">
              <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 text-xs font-medium">
                <span>You have unsaved profile changes. Don't forget to save!</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    type="button"
                    onClick={handleDiscardChanges}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600 h-8 px-3 text-xs font-semibold cursor-pointer"
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-8 px-4 text-xs shadow-md cursor-pointer"
                  >
                    Save Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* FTUE Onboarding Wizard Bottom Navigation Stepper */}
      {!onboardingCompleted && (
        <OnboardingWizardFooterNav
          currentStep={wizardStep}
          isFreePlan={planType === "free"}
          onNext={handleWizardNext}
          onBack={handleWizardBack}
          onFinish={handleFinishAndPublish}
          onSkipStep={handleSkipStep}
        />
      )}

      {/* FTUE Onboarding Wizard Publish Success Modal */}
      <PublishSuccessModal
        open={showPublishSuccessModal}
        onClose={() => setShowPublishSuccessModal(false)}
        username={username}
        readiness={evaluateReadiness()}
      />

      {/* FTUE Onboarding Wizard Draft Warning Modal */}
      <DraftWarningModal
        open={showDraftWarningModal}
        onClose={() => setShowDraftWarningModal(false)}
        username={username}
        readiness={evaluateReadiness()}
        onNavigateToItem={handleNavigateToItem}
      />

      {/* Mobile Readiness Checklist Bottom Sheet (Phase B) */}
      <MobileReadinessSheet
        open={mobileReadinessSheetOpen}
        onClose={() => setMobileReadinessSheetOpen(false)}
        readiness={evaluateReadiness()}
        onNavigateToItem={handleNavigateToItem}
      />
      {/* In-App Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={(open) => {
          setShowUpgradeModal(open);
          if (!open && typeof window !== "undefined") {
            sessionStorage.setItem("feedmee_trial_expired_dismissed", "true");
          }
        }}
      />
      {/* Contextual Extra Feed Add-on Modal */}
      <ExtraFeedModal
        isOpen={showExtraFeedModal}
        onClose={() => setShowExtraFeedModal(false)}
        planType={planType}
        userEmail={userEmail}
        username={username}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
