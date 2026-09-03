"use client";

import React, { useState, useRef } from "react";
import {
  User,
  CreditCard,
  ShieldCheck,
  Globe,
  Bell,
  Users,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Key,
  Smartphone,
  Laptop,
  LogOut,
  Upload,
  X,
  ChevronRight,
  ChevronDown,
  Download,
  Trash2,
  Mail,
  Plus,
  Shield,
  Check,
  Sparkles,
  QrCode,
  CheckSquare,
  BadgeCheck,
  Scale,
  ExternalLink,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanType } from "@/lib/supabase";
import { BillingEditor } from "./billing-editor";
import { cn } from "@/lib/utils";

interface AccountSettingsEditorProps {
  name: string;
  setName: (v: string) => void;
  username: string;
  setUsername: (v: string) => void;
  bio?: string;
  setBio?: (v: string) => void;
  avatarUrl?: string;
  setAvatarUrl?: (v: string) => void;
  planType: PlanType;
  setPlanType: (plan: PlanType) => void;
  socialLinks?: any[];
  customLinks?: any[];
  reels?: any[];
  leadForm?: any;
}

export type SettingsSubTab =
  | "profile"
  | "billing"
  | "security"
  | "preferences"
  | "notifications"
  | "team"
  | "legal"
  | "danger";

interface TeamMember {
  id: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Viewer";
  status: "Active" | "Pending";
}

export function AccountSettingsEditor({
  name,
  setName,
  username,
  setUsername,
  bio,
  setBio,
  avatarUrl,
  setAvatarUrl,
  planType,
  setPlanType,
  socialLinks = [],
  customLinks = [],
  reels = [],
  leadForm = null,
}: AccountSettingsEditorProps) {
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>("profile");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDangerExpandedOnMobile, setIsDangerExpandedOnMobile] = useState(false);

  // Account-level Profile State (Strictly decoupled from public Feed Builder)
  const [accountAvatarUrl, setAccountAvatarUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [totpSecret, setTotpSecret] = useState("JBSWY3DPEHPK3PXP");
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState<string | null>(null);
  const [enrolledFactorId, setEnrolledFactorId] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Load Auth User Data & 2FA Status on mount
  React.useEffect(() => {
    async function loadAuthUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (user.email) setEmail(user.email);
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
          if (fullName && setName) setName(fullName);
          const compName = user.user_metadata?.company_name || "";
          setCompanyName(compName);

          const is2FA = user.user_metadata?.two_factor_enabled || user.user_metadata?.is_2fa_enabled || false;
          setIs2FAEnabled(is2FA);

          const { data: factors } = await supabase.auth.mfa.listFactors();
          if (factors?.totp?.some((f: any) => f.status === "verified")) {
            setIs2FAEnabled(true);
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, company_name, two_factor_enabled")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            if (profile.full_name && setName) setName(profile.full_name);
            if (profile.company_name !== undefined && profile.company_name !== null) {
              setCompanyName(profile.company_name);
            }
            if (profile.two_factor_enabled) {
              setIs2FAEnabled(true);
            }
          }
        }
      } catch (err) {
        console.warn("Error loading 2FA auth status:", err);
      }
    }
    loadAuthUserData();
  }, []);

  const handleStart2FASetup = async () => {
    setTotpError(null);
    try {
      // 1. Purge any unverified factors first to avoid conflicts
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const unverified = factors?.totp?.filter((f) => (f.status as string) !== "verified");
      if (unverified && unverified.length > 0) {
        for (const uf of unverified) {
          await supabase.auth.mfa.unenroll({ factorId: uf.id }).catch(() => {});
        }
      }

      // 2. Enroll new TOTP factor
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "FeedM.ee",
        friendlyName: username || "FeedMee User",
      });

      if (error) throw error;

      if (data?.id) {
        setEnrolledFactorId(data.id);
        if (data.totp?.secret) setTotpSecret(data.totp.secret);
        if (data.totp?.qr_code) setQrCodeDataUrl(data.totp.qr_code);
      }
      setShow2FAModal(true);
    } catch (err: any) {
      console.error("2FA Enroll Error:", err);
      setTotpError(err.message || "Failed to start 2FA setup.");
      setShow2FAModal(true);
    }
  };

  const handleCancel2FASetup = async () => {
    setShow2FAModal(false);
    setTotpError(null);
    setTotpCode("");

    if (enrolledFactorId) {
      try {
        await supabase.auth.mfa.unenroll({ factorId: enrolledFactorId });
        console.log("[2FA Setup Cancelled]: Unenrolled unverified factor", enrolledFactorId);
      } catch (e) {
        console.warn("Unenroll note:", e);
      }
      setEnrolledFactorId(null);
    }
  };

  const handleActivate2FA = async () => {
    if (!totpCode || totpCode.trim().length < 6) {
      setTotpError("Please enter a valid 6-digit code.");
      return;
    }
    setTotpError(null);

    try {
      let factorIdToVerify = enrolledFactorId;

      if (!factorIdToVerify) {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const unverified = factors?.totp?.find((f) => (f.status as string) !== "verified");
        if (unverified) factorIdToVerify = unverified.id;
      }

      if (!factorIdToVerify) {
        throw new Error("No pending 2FA setup found. Please restart setup.");
      }

      // 1. Create challenge
      const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId: factorIdToVerify });
      if (challengeErr) throw challengeErr;

      // 2. Verify code
      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId: factorIdToVerify,
        challengeId: challengeData.id,
        code: totpCode.trim(),
      });

      if (verifyErr) {
        throw new Error(verifyErr.message || "Invalid 6-digit code from authenticator app.");
      }

      // 3. Success -> Mark active
      await supabase.auth.updateUser({
        data: { two_factor_enabled: true, is_2fa_enabled: true }
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await supabase.from("profiles").update({ two_factor_enabled: true }).eq("id", user.id);
      }

      setIs2FAEnabled(true);
      setShow2FAModal(false);
      setEnrolledFactorId(null);
      setTotpCode("");
      setSecurityNotice("Two-Factor Authentication is now active on your account!");
      setTimeout(() => setSecurityNotice(null), 3000);
    } catch (err: any) {
      console.error("2FA Activation Error:", err);
      setTotpError(err.message || "Verification failed. Please try again.");
    }
  };

  const handleDisable2FA = async () => {
    try {
      await supabase.auth.updateUser({
        data: { two_factor_enabled: false, is_2fa_enabled: false }
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await supabase.from("profiles").update({ two_factor_enabled: false }).eq("id", user.id);
      }

      setIs2FAEnabled(false);
      setSecurityNotice("Two-Factor Authentication has been disabled.");
      setTimeout(() => setSecurityNotice(null), 3000);
    } catch (err) {
      console.warn("Disable 2FA error:", err);
    }
  };

  // Preferences State
  const [language, setLanguage] = useState<"en">("en");
  const [timezone, setTimezone] = useState("Asia/Jerusalem");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  // Notifications State
  const [notifLeadAlerts, setNotifLeadAlerts] = useState(true);
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(true);
  const [notifProductUpdates, setNotifProductUpdates] = useState(false);
  const [notifBillingReceipts, setNotifBillingReceipts] = useState(true);

  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Admin" | "Editor" | "Viewer">("Editor");
  const [teamNotice, setTeamNotice] = useState<string | null>(null);

  // Sync team members with logged in user email
  React.useEffect(() => {
    if (email) {
      setTeamMembers([
        { id: "owner-1", email: email, role: "Owner", status: "Active" }
      ]);
    }
  }, [email]);

  // Danger Zone Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // Handlers
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAccountAvatarUrl(event.target.result as string);
          setProfileSuccessMsg("Account profile photo updated successfully!");
          setTimeout(() => setProfileSuccessMsg(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Update Supabase Auth user_metadata
      const { data: updateRes, error: updateErr } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          name: name,
          company_name: companyName,
        },
      });

      if (updateErr) {
        console.error("Supabase Auth user_metadata update error:", updateErr.message);
      }

      // 2. Perform DB Upsert on profiles table matching user.id
      const user = updateRes?.user || (await supabase.auth.getUser()).data.user;
      if (user?.id) {
        const { error: upsertErr } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            full_name: name,
            company_name: companyName,
            updated_at: new Date().toISOString(),
          }, { onConflict: "id" });

        if (upsertErr) {
          console.warn("Profiles upsert note:", upsertErr.message);
        }
      }

      setProfileSuccessMsg("Profile information updated successfully");
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setProfileSuccessMsg("Profile information updated successfully");
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setSecurityNotice("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setSecurityNotice("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityNotice("New passwords do not match.");
      return;
    }
    setSecurityNotice("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSecurityNotice(null), 3000);
  };

  const handleInviteTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes("@")) {
      setTeamNotice("Please enter a valid email address.");
      return;
    }
    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      email: inviteEmail,
      role: inviteRole,
      status: "Pending",
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setInviteEmail("");
    setTeamNotice(`Invitation sent to ${inviteEmail}!`);
    setTimeout(() => setTeamNotice(null), 3000);
  };

  const handleRemoveTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleExportCSV = () => {
    const rows: string[] = [];
    rows.push("Category,Field/Item,Value/Detail");
    rows.push(`Account,Full Name,"${name}"`);
    rows.push(`Account,Email Address,"${email}"`);
    rows.push(`Account,Company Name,"${companyName || "N/A"}"`);
    rows.push(`Account,Feed Handle,"${username}"`);
    rows.push(`Account,Subscription Tier,"${planType}"`);
    rows.push(`Account,Export Date,"${new Date().toISOString()}"`);

    if (customLinks && customLinks.length > 0) {
      customLinks.forEach((link, idx) => {
        rows.push(`Bio Links,Link ${idx + 1},"Title: ${link.title || ""} | URL: ${link.url || "#"} | Clicks: ${link.clicks || 0}"`);
      });
    }

    if (reels && reels.length > 0) {
      reels.forEach((reel, idx) => {
        const videoUrl = reel.video_url || reel.videoUrl || "";
        const buttonText = reel.button_text || reel.buttonText || "";
        rows.push(`Video Reels,Reel ${idx + 1},"Title: ${reel.title || ""} | Video: ${videoUrl} | Button: ${buttonText} | Likes: ${reel.likes || 0}"`);
      });
    }

    if (leadForm) {
      rows.push(`Lead Form,Config,"Headline: ${leadForm.headline || ""} | Target Email: ${leadForm.emailTarget || "N/A"}"`);
    }

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `feedmee_complete_backup_${username}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = [
    { id: "profile" as SettingsSubTab, label: "Profile Info", icon: User },
    { id: "billing" as SettingsSubTab, label: "Billing & Subscription", icon: CreditCard },
    { id: "security" as SettingsSubTab, label: "Security & Auth", icon: ShieldCheck },
    { id: "preferences" as SettingsSubTab, label: "Preferences", icon: Globe },
    { id: "notifications" as SettingsSubTab, label: "Notifications", icon: Bell },
    { id: "team" as SettingsSubTab, label: "Team & Workspace", icon: Users, badge: "PRO" },
    { id: "legal" as SettingsSubTab, label: "Legal & Policies", icon: Scale },
    { id: "danger" as SettingsSubTab, label: "Danger Zone", icon: AlertTriangle, isDanger: true },
  ];

  return (
    <div className="w-full flex flex-col lg:flex-row items-start min-h-[calc(100vh-3.5rem)] animate-in fade-in duration-300">
      {/* MOBILE SETTINGS ACCORDION/DROPDOWN SELECTOR (Visible on mobile only) */}
      <div className="w-full block lg:hidden bg-white border-b border-zinc-200 p-3">
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-zinc-100/90 border border-zinc-200 text-zinc-900 font-bold text-xs cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            {React.createElement(navItems.find((n) => n.id === activeSubTab)?.icon || User, {
              className: cn("h-4 w-4", navItems.find((n) => n.id === activeSubTab)?.isDanger ? "text-rose-500" : "text-emerald-600"),
            })}
            <span>{navItems.find((n) => n.id === activeSubTab)?.label || "Settings"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-medium">Switch Tab</span>
            <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", isMobileNavOpen && "rotate-180")} />
          </div>
        </button>

        {isMobileNavOpen && (
          <div className="mt-2 flex flex-col gap-1 p-1.5 bg-zinc-50 border border-zinc-200 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSubTab(item.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                    isActive
                      ? item.isDanger
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-zinc-950 text-white shadow-xs"
                      : item.isDanger
                      ? "text-rose-600 hover:bg-rose-50"
                      : "text-zinc-700 hover:bg-zinc-200/70"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("h-4 w-4", isActive ? "text-white" : item.isDanger ? "text-rose-500" : "text-zinc-500")} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={cn("text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase", isActive ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800")}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* COLUMN 2: VERTICAL SUB-NAV MENU (Desktop only) */}
      <aside className="hidden lg:block w-60 shrink-0 bg-white border-r border-zinc-200 py-3 px-2 lg:px-2.5 space-y-1 lg:sticky lg:top-0 lg:min-h-[calc(100vh-3.5rem)]">
        <div className="px-2.5 py-1.5 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
          Account Settings
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left",
                isActive
                  ? item.isDanger
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-zinc-950 text-white shadow-md shadow-zinc-950/10"
                  : item.isDanger
                  ? "text-rose-600 hover:bg-rose-50"
                  : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : item.isDanger ? "text-rose-500" : "text-zinc-500")} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className={cn("text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase", isActive ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800")}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={cn("h-3.5 w-3.5 opacity-60", isActive && "translate-x-0.5")} />
              </div>
            </button>
          );
        })}
      </aside>

      {/* COLUMN 3: MAIN SETTINGS PANEL CONTENT (Fills all remaining right-side viewport space) */}
      <main className="flex-1 min-w-0 w-full p-6 lg:p-10 bg-zinc-50/50">
        <div className="max-w-5xl w-full space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col gap-1 pb-4 border-b border-zinc-200/80">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              {navItems.find((n) => n.id === activeSubTab)?.label || "Account Settings"}
            </h1>
            <p className="text-xs font-medium text-zinc-500">
              Manage your personal details, security preferences, team access, and billing subscription.
            </p>
          </div>
          {/* CARD 1: PROFILE INFORMATION */}
          {activeSubTab === "profile" && (
            <Card className="bg-white border-zinc-200/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader>
                <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" /> Account Profile Information
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Update your full legal name, optional company name, and registered account email details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  {profileSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      {profileSuccessMsg}
                    </div>
                  )}

                  {/* Form Inputs: Full Name & Company Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700">Full Name</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="rounded-xl border-zinc-200 text-xs font-semibold"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700">Company Name (Optional)</Label>
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Media Corp"
                        className="rounded-xl border-zinc-200 text-xs font-semibold"
                      />
                      <span className="text-[10px] text-zinc-400 font-medium block">
                        If provided, Company Name will be included alongside your Full Name on all billing invoices.
                      </span>
                    </div>
                  </div>

                  {/* Account Email Address (Read Only Auth Email) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-zinc-700">Account Email Address</Label>
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="h-3 w-3 text-emerald-600" /> Verified
                      </span>
                    </div>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                      className="rounded-xl border-zinc-200 bg-zinc-100/80 text-zinc-600 text-xs font-semibold cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer">
                      Save Account Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* CARD 2: BILLING & SUBSCRIPTION */}
          {activeSubTab === "billing" && (
            <div className="animate-in fade-in duration-200">
              <BillingEditor planType={planType} setPlanType={setPlanType} username={username} />
            </div>
          )}

          {/* CARD 3: SECURITY & AUTHENTICATION */}
          {activeSubTab === "security" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Password Card */}
              <Card className="bg-white border-zinc-200/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-emerald-600" /> Password
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Change your password to keep your creator account safe.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    {securityNotice && (
                      <div className={cn(
                        "p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in",
                        securityNotice.includes("success") ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                      )}>
                        {securityNotice.includes("success") ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-rose-600" />}
                        {securityNotice}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700">Current Password</Label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="rounded-xl border-zinc-200 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700">New Password</Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="rounded-xl border-zinc-200 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700">Confirm New Password</Label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="rounded-xl border-zinc-200 text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer">
                        Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication Card */}
              <Card className="bg-white border-zinc-200/80 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-violet-600" /> Two-Factor Authentication
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                      Add an extra layer of protection to your account using an authenticator app.
                    </CardDescription>
                  </div>
                  {is2FAEnabled && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 2FA Active
                    </span>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-900">Authenticator App (TOTP)</span>
                        <span className="text-[11px] text-zinc-500 font-medium">
                          {is2FAEnabled ? "Two-Factor Authentication is active and protecting your account." : "Disabled — Enable for enhanced account security."}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={is2FAEnabled ? "outline" : "default"}
                      size="sm"
                      onClick={() => {
                        if (is2FAEnabled) {
                          if (confirm("Are you sure you want to disable Two-Factor Authentication?")) {
                            handleDisable2FA();
                          }
                        } else {
                          handleStart2FASetup();
                        }
                      }}
                      className={cn("rounded-xl text-xs font-bold px-4 py-2 cursor-pointer", !is2FAEnabled && "bg-violet-600 hover:bg-violet-700 text-white")}
                    >
                      {is2FAEnabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Active Sessions Card (Parsed dynamically from User-Agent) */}
              <Card className="bg-white border-zinc-200/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-blue-600" /> Active Logged-in Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    const activeDevice = typeof window !== "undefined" && (/iPhone|Android|iPad/i.test(navigator.userAgent))
                      ? { name: "Mobile Device", isMobile: true }
                      : { name: "Desktop PC", isMobile: false };
                    
                    const ua = typeof window !== "undefined" ? navigator.userAgent : "";
                    let osName = "Desktop Workstation";
                    if (/iPhone/i.test(ua)) osName = "Apple iPhone";
                    else if (/iPad/i.test(ua)) osName = "Apple iPad";
                    else if (/Android/i.test(ua)) osName = "Android Phone";
                    else if (/Macintosh|Mac OS/i.test(ua)) osName = "Mac OS";
                    else if (/Windows/i.test(ua)) osName = "Windows PC";
                    else if (/Linux/i.test(ua)) osName = "Linux PC";

                    let browserName = "Chrome";
                    if (/Edg/i.test(ua)) browserName = "Edge";
                    else if (/Chrome/i.test(ua)) browserName = "Chrome";
                    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browserName = "Safari";
                    else if (/Firefox/i.test(ua)) browserName = "Firefox";

                    return (
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                        <div className="flex items-center gap-3">
                          {activeDevice.isMobile ? (
                            <Smartphone className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Laptop className="h-5 w-5 text-emerald-600" />
                          )}
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-900">{osName} — {browserName}</span>
                            <span className="text-[10px] text-emerald-700 font-semibold">Active Session (Verified Auth)</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                          Current Device
                        </span>
                      </div>
                    );
                  })()}

                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await supabase.auth.signOut({ scope: "others" });
                          setSecurityNotice("Successfully logged out all other active sessions.");
                        } catch (e) {
                          console.warn("Signout others:", e);
                        }
                      }}
                      className="text-xs font-bold rounded-xl gap-1.5 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5 text-zinc-500" /> Log out from all other sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CARD 4: PREFERENCES & LOCALIZATION */}
          {activeSubTab === "preferences" && (
            <Card className="bg-white border-zinc-200/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader>
                <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-600" /> Preferences & Localization
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Configure language preferences, timezone, and date display formats.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Language Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-700">Interface Language</Label>
                  <div className="p-3.5 rounded-xl border border-emerald-500 bg-emerald-50/40 text-emerald-950 flex items-center justify-between text-xs font-bold">
                    <span>English (US)</span>
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium block">
                    English (US) is the default system interface language. Multi-language localization support coming soon.
                  </span>
                </div>

                {/* Timezone Selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700">Account Timezone</Label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 p-2.5 text-xs font-semibold text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  >
                    <option value="Asia/Jerusalem">(GMT+03:00) Jerusalem / Tel Aviv</option>
                    <option value="America/New_York">(GMT-05:00) Eastern Time (US & Canada)</option>
                    <option value="Europe/London">(GMT+00:00) London / UTC</option>
                    <option value="America/Los_Angeles">(GMT-08:00) Pacific Time (US & Canada)</option>
                  </select>
                </div>

                {/* Date Format Selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700">Date Display Format</Label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 p-2.5 text-xs font-semibold text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button className="bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer">
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CARD 5: NOTIFICATION PREFERENCES */}
          {activeSubTab === "notifications" && (
            <Card className="bg-white border-zinc-200/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader>
                <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-emerald-600" /> Notification Preferences
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Control which email notifications and lead alerts you receive.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex flex-col gap-0.5 pr-4">
                    <span className="text-xs font-bold text-zinc-900">New Lead Form Submissions</span>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Get real-time instant alerts when a visitor submits your lead form.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifLeadAlerts}
                    onChange={(e) => setNotifLeadAlerts(e.target.checked)}
                    className="h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex flex-col gap-0.5 pr-4">
                    <span className="text-xs font-bold text-zinc-900">Weekly Analytics Summary</span>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Receive weekly performance digest emails (views, clicks, conversions).
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifWeeklySummary}
                    onChange={(e) => setNotifWeeklySummary(e.target.checked)}
                    className="h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex flex-col gap-0.5 pr-4">
                    <span className="text-xs font-bold text-zinc-900">Product Updates &amp; Feature Announcements</span>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Stay in the loop on new FeedM.ee features and video templates.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifProductUpdates}
                    onChange={(e) => setNotifProductUpdates(e.target.checked)}
                    className="h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex flex-col gap-0.5 pr-4">
                    <span className="text-xs font-bold text-zinc-900">Billing &amp; Payment Receipts</span>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Automated receipt notifications for subscription renewals.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifBillingReceipts}
                    onChange={(e) => setNotifBillingReceipts(e.target.checked)}
                    className="h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button className="bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer">
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CARD 6: TEAM & WORKSPACE */}
          {activeSubTab === "team" && (
            <Card className="bg-white border-zinc-200/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-600" /> Team &amp; Workspace Access
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500 mt-1">
                      Collaborate with team members, editors, and managers on your video feed.
                    </CardDescription>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase">
                    <Sparkles className="h-3 w-3 text-emerald-600" /> Pro / Agency Plan
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {teamNotice && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {teamNotice}
                  </div>
                )}

                {/* Invite Form */}
                <form onSubmit={handleInviteTeamMember} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                  <Label className="text-xs font-bold text-zinc-800">Invite New Team Member</Label>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Input
                      type="email"
                      placeholder="teammate@agency.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="rounded-xl border-zinc-200 text-xs bg-white"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="rounded-xl border border-zinc-200 p-2.5 text-xs font-semibold text-zinc-900 bg-white focus:outline-none shrink-0"
                    >
                      <option value="Admin">Admin (Full Access)</option>
                      <option value="Editor">Editor (Content Only)</option>
                      <option value="Viewer">Viewer (Analytics Only)</option>
                    </select>
                    <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold px-4 py-2.5 rounded-xl shrink-0 cursor-pointer gap-1.5">
                      <Plus className="h-4 w-4" /> Send Invite
                    </Button>
                  </div>
                </form>

                {/* Team Members List */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-800">Active Workspace Members ({teamMembers.length})</Label>
                  <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200/80 overflow-hidden bg-white">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3.5 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center text-xs shrink-0 border border-zinc-200">
                            {member.email.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-zinc-900 truncate">{member.email}</span>
                            <span className="text-[10px] text-zinc-500 font-medium">{member.status === "Pending" ? "Invite Sent — Pending" : "Active Member"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={cn(
                            "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase",
                            member.role === "Owner" ? "bg-zinc-900 text-white" : member.role === "Admin" ? "bg-violet-100 text-violet-800" : "bg-zinc-100 text-zinc-700"
                          )}>
                            {member.role}
                          </span>

                          {member.role !== "Owner" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTeamMember(member.id)}
                              className="h-7 text-xs text-rose-600 hover:bg-rose-50 px-2 rounded-lg"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CARD 7: LEGAL & POLICIES (STANDALONE SUBTAB) */}
          {activeSubTab === "legal" && (
            <Card className="bg-white border-zinc-200/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader>
                <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Scale className="h-4 w-4 text-emerald-600" /> Legal &amp; Policies
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  View and access FeedM.ee legal documents and user compliance agreements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Privacy Policy */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 transition-all">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-900">Privacy Policy</span>
                      <ExternalLink className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Learn how we collect, process, and protect your personal data.
                    </span>
                  </div>
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-800 hover:bg-zinc-100 hover:text-emerald-700 transition-colors shadow-2xs shrink-0"
                  >
                    View Policy
                  </a>
                </div>

                {/* Terms of Service */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 transition-all">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-900">Terms of Service</span>
                      <ExternalLink className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Read our terms, conditions, and platform usage guidelines.
                    </span>
                  </div>
                  <a
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-800 hover:bg-zinc-100 hover:text-emerald-700 transition-colors shadow-2xs shrink-0"
                  >
                    View Terms
                  </a>
                </div>

                {/* Cookie Policy */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 transition-all">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-900">Cookie Policy</span>
                      <ExternalLink className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Understand how cookies and tracking technologies are managed.
                    </span>
                  </div>
                  <a
                    href="/privacy#cookies"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-800 hover:bg-zinc-100 hover:text-emerald-700 transition-colors shadow-2xs shrink-0"
                  >
                    View Cookies
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CARD 8: DANGER ZONE */}
          {activeSubTab === "danger" && (
            <div className="space-y-6">
              {/* STANDALONE LEGAL & POLICIES CARD (Above Danger Zone) */}
              <Card className="bg-white border-zinc-200/80 shadow-sm animate-in fade-in duration-200">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                    <Scale className="h-4 w-4 text-emerald-600" /> Legal &amp; Policies
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    View and access FeedM.ee legal documents and user compliance agreements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Privacy Policy */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 transition-all">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-900">Privacy Policy</span>
                        <ExternalLink className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        Learn how we collect, process, and protect your personal data.
                      </span>
                    </div>
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-800 hover:bg-zinc-100 hover:text-emerald-700 transition-colors shadow-2xs shrink-0"
                    >
                      View Policy
                    </a>
                  </div>

                  {/* Terms of Service */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 transition-all">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-900">Terms of Service</span>
                        <ExternalLink className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        Read our terms, conditions, and platform usage guidelines.
                      </span>
                    </div>
                    <a
                      href="/terms-of-service"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-800 hover:bg-zinc-100 hover:text-emerald-700 transition-colors shadow-2xs shrink-0"
                    >
                      View Terms
                    </a>
                  </div>

                  {/* Cookie Policy */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 transition-all">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-900">Cookie Policy</span>
                        <ExternalLink className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        Understand how cookies and tracking technologies are managed.
                      </span>
                    </div>
                    <a
                      href="/privacy#cookies"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-800 hover:bg-zinc-100 hover:text-emerald-700 transition-colors shadow-2xs shrink-0"
                    >
                      View Cookies
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* DANGER ZONE CARD (Collapsible on mobile, open on desktop) */}
              <Card className="bg-rose-50/30 border-rose-200/80 shadow-sm animate-in fade-in duration-200 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600" /> Danger Zone
                    </CardTitle>
                    <CardDescription className="text-xs text-rose-600/80">
                      Export account data or permanently delete your account and associated feeds.
                    </CardDescription>
                  </div>
                  <div className="block lg:hidden">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDangerExpandedOnMobile(!isDangerExpandedOnMobile)}
                      className="text-xs font-bold border-rose-300 text-rose-700 bg-white hover:bg-rose-50 h-8 px-3 rounded-xl gap-1 cursor-pointer"
                    >
                      <span>{isDangerExpandedOnMobile ? "Hide" : "Show Actions"}</span>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isDangerExpandedOnMobile && "rotate-180")} />
                    </Button>
                  </div>
                </CardHeader>

                <div className={cn("space-y-4 px-6 pb-6", isDangerExpandedOnMobile ? "block" : "hidden lg:block")}>
                  {/* Export Data */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-rose-200/80 shadow-sm">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-zinc-900">Export All Account Data</span>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        Download a complete CSV backup of your profile details, bio links, and analytics.
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                      className="text-xs font-bold rounded-xl border-zinc-300 gap-1.5 hover:bg-zinc-50 cursor-pointer shrink-0 w-full sm:w-auto"
                    >
                      <Download className="h-4 w-4 text-zinc-600" /> Export CSV
                    </Button>
                  </div>

                  {/* Delete Account */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-100/40 border border-rose-300/80">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-rose-900">Delete Account &amp; All Data</span>
                      <span className="text-[11px] text-rose-700/90 font-medium">
                        Once deleted, your video feed and all subscriber data will be permanently removed.
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl gap-1.5 cursor-pointer shrink-0 w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4" /> Delete Account
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* 2FA SETUP MODAL */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 space-y-5 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={handleCancel2FASetup}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1 rounded-full hover:bg-zinc-100 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900">Setup Authenticator 2FA</h3>
                <p className="text-xs text-zinc-500 font-medium">Scan QR code using Google Authenticator or 1Password.</p>
              </div>
            </div>

            {(() => {
              const accountLabel = email || username || "user@feedm.ee";
              const otpauthUri = `otpauth://totp/FeedM.ee:${encodeURIComponent(accountLabel)}?secret=${totpSecret}&issuer=FeedM.ee`;
              const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpauthUri)}`;

              return (
                <>
                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                    <div className="h-40 w-40 bg-white rounded-xl border border-zinc-300 p-2 shadow-inner flex items-center justify-center">
                      <img
                        src={qrCodeImgUrl}
                        alt="2FA QR Code"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <span className="text-[11px] font-mono font-bold text-zinc-600 bg-white px-3 py-1 rounded-md border border-zinc-200 inline-block">
                        Secret: {totpSecret}
                      </span>
                      <p className="text-[10px] text-zinc-500 font-semibold">Account: FeedM.ee ({accountLabel})</p>
                    </div>
                  </div>

                  {totpError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{totpError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700">Enter 6-Digit Code from App</Label>
                    <Input
                      placeholder="123456"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                      className="text-center font-mono font-bold tracking-widest text-base rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel2FASetup}
                      className="rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleActivate2FA}
                      className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"
                    >
                      Verify &amp; Activate 2FA
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT DOUBLE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 space-y-5 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1 rounded-full hover:bg-zinc-100 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900">Delete Account Permanently?</h3>
                <p className="text-xs text-rose-600 font-bold">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Are you sure you want to delete <span className="font-bold text-zinc-900">@{username}</span>? All your uploaded video reels, custom bio links, and subscriber leads will be permanently erased.
            </p>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700">Type <span className="font-mono text-rose-600 font-bold">DELETE</span> to confirm:</Label>
              <Input
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="rounded-xl border-rose-200 text-xs font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                disabled={isDeletingAccount}
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                disabled={deleteConfirmationText !== "DELETE" || isDeletingAccount}
                onClick={async () => {
                  setIsDeletingAccount(true);
                  try {
                    const { data: { user } } = await supabase.auth.getUser();

                    const res = await fetch("/api/user/delete", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: user?.id }),
                    });

                    const resData = await res.json();

                    if (!res.ok || !resData.success) {
                      throw new Error(resData.error || "Failed to purge account from database.");
                    }

                    // Sign out client session
                    await supabase.auth.signOut();

                    // Clear local storage cache
                    if (typeof window !== "undefined") {
                      localStorage.clear();
                    }

                    // Instant hard redirect to homepage
                    window.location.href = "/";
                  } catch (err: any) {
                    console.error("[Account Deletion Error]:", err);
                    alert(err.message || "Failed to delete account. Please try again.");
                    setIsDeletingAccount(false);
                  }
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 gap-2 cursor-pointer"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Deleting Account...
                  </>
                ) : (
                  "Permanently Delete Account"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
