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
  Download,
  Trash2,
  Mail,
  Plus,
  Shield,
  Check,
  Sparkles,
  QrCode,
  CheckSquare,
  BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  bio: string;
  setBio: (v: string) => void;
  avatarUrl: string;
  setAvatarUrl: (v: string) => void;
  planType: PlanType;
  setPlanType: (plan: PlanType) => void;
}

export type SettingsSubTab =
  | "profile"
  | "billing"
  | "security"
  | "preferences"
  | "notifications"
  | "team"
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
}: AccountSettingsEditorProps) {
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>("profile");

  // Profile Form Local State
  const [brandName, setBrandName] = useState("Rivers Media Studio");
  const [email, setEmail] = useState("alex@riversmedia.com");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Preferences State
  const [language, setLanguage] = useState<"en" | "he">("en");
  const [timezone, setTimezone] = useState("Asia/Jerusalem");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  // Notifications State
  const [notifLeadAlerts, setNotifLeadAlerts] = useState(true);
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(true);
  const [notifProductUpdates, setNotifProductUpdates] = useState(false);
  const [notifBillingReceipts, setNotifBillingReceipts] = useState(true);

  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: "1", email: "alex@riversmedia.com", role: "Owner", status: "Active" },
    { id: "2", email: "sarah@riversmedia.com", role: "Editor", status: "Active" },
    { id: "3", email: "marcus@riversmedia.com", role: "Viewer", status: "Pending" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Admin" | "Editor" | "Viewer">("Editor");
  const [teamNotice, setTeamNotice] = useState<string | null>(null);

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
          setAvatarUrl(event.target.result as string);
          setProfileSuccessMsg("Avatar updated successfully!");
          setTimeout(() => setProfileSuccessMsg(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg("Profile information saved successfully!");
    setTimeout(() => setProfileSuccessMsg(null), 3000);
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
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Type,Title/Name,Detail\n" +
      `Profile,${name},@${username}\n` +
      `Plan,${planType},Active\n` +
      `ExportDate,${new Date().toISOString()},System`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `feedmee_account_export_${username}.csv`);
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
    { id: "danger" as SettingsSubTab, label: "Danger Zone", icon: AlertTriangle, isDanger: true },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col gap-1 pb-2 border-b border-zinc-200/80">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          Account Settings
        </h1>
        <p className="text-xs font-medium text-zinc-500">
          Manage your personal details, security preferences, team access, and billing subscription.
        </p>
      </div>

      {/* 3-COLUMN / SUB-NAV LAYOUT (Column 2: Vertical Sub-Nav | Column 3: Main Settings Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMN 2: VERTICAL SUB-NAV MENU (3 cols on lg screens) */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-zinc-200/80 p-2.5 shadow-sm space-y-1 sticky top-24">
          <div className="px-3 py-2 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  isActive
                    ? item.isDanger
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                      : "bg-zinc-900 text-white shadow-md shadow-zinc-900/10"
                    : item.isDanger
                    ? "text-rose-600 hover:bg-rose-50"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
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

        {/* COLUMN 3: MAIN SETTINGS PANEL CONTENT (9 cols on lg screens) */}
        <main className="lg:col-span-9 space-y-6">
          {/* CARD 1: PROFILE INFORMATION */}
          {activeSubTab === "profile" && (
            <Card className="bg-white border-zinc-200/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader>
                <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" /> Profile Information
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Update your account avatar, display name, public handle, and personal contact details.
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

                  {/* Avatar Upload */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                    <div className="relative shrink-0">
                      <img
                        src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"}
                        alt={name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    </div>
                    <div className="flex flex-col gap-2 min-w-0">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => avatarInputRef.current?.click()}
                          className="h-8 text-xs font-bold rounded-xl gap-1.5 cursor-pointer"
                        >
                          <Upload className="h-3.5 w-3.5 text-zinc-600" /> Upload New Photo
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop");
                          }}
                          className="h-8 text-xs text-rose-600 hover:bg-rose-50 rounded-xl"
                        >
                          Reset
                        </Button>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        Supports JPG, PNG or WEBP (Max 5MB)
                      </span>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700">Full Name</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border-zinc-200 text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700">Public Display / Brand Name</Label>
                      <Input
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="rounded-xl border-zinc-200 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700">Username / Handle</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-zinc-400">@</span>
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                          className="pl-7 rounded-xl border-zinc-200 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-zinc-700">Email Address</Label>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <BadgeCheck className="h-3 w-3 text-emerald-600" /> Verified
                        </span>
                      </div>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl border-zinc-200 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700">Short Bio</Label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-zinc-200 p-3 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer">
                      Save Profile Changes
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
                    <Lock className="h-4 w-4 text-emerald-600" /> Password & Authentication
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

              {/* 2FA Card */}
              <Card className="bg-white border-zinc-200/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-violet-600" /> Two-Factor Authentication (2FA)
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Add an extra layer of protection to your account using an authenticator app.
                  </CardDescription>
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
                          {is2FAEnabled ? "2FA is active and protecting your account." : "Disabled — Enable for enhanced account security."}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={is2FAEnabled ? "outline" : "default"}
                      size="sm"
                      onClick={() => setShow2FAModal(true)}
                      className={cn("rounded-xl text-xs font-bold px-4 py-2 cursor-pointer", !is2FAEnabled && "bg-violet-600 hover:bg-violet-700 text-white")}
                    >
                      {is2FAEnabled ? "Manage 2FA" : "Enable 2FA"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Active Sessions Card */}
              <Card className="bg-white border-zinc-200/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-blue-600" /> Active Logged-in Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                    <div className="flex items-center gap-3">
                      <Laptop className="h-5 w-5 text-emerald-600" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-900">Windows PC — Chrome</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">Current Active Session (Tel Aviv, IL)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">This Device</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-zinc-500" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-900">iPhone 15 Pro — Safari</span>
                        <span className="text-[10px] text-zinc-500 font-medium">Last active 2 hours ago</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-rose-600 hover:bg-rose-50 rounded-lg">
                      Revoke
                    </Button>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl gap-1.5 text-zinc-700 hover:bg-zinc-100">
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
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLanguage("en")}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                        language === "en" ? "border-emerald-500 bg-emerald-50/40 text-emerald-950 shadow-sm" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      <span>English (US)</span>
                      {language === "en" && <Check className="h-4 w-4 text-emerald-600" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage("he")}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                        language === "he" ? "border-emerald-500 bg-emerald-50/40 text-emerald-950 shadow-sm" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      <span>Hebrew (עברית)</span>
                      {language === "he" && <Check className="h-4 w-4 text-emerald-600" />}
                    </button>
                  </div>
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

          {/* CARD 7: DANGER ZONE */}
          {activeSubTab === "danger" && (
            <Card className="bg-rose-50/30 border-rose-200/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader>
                <CardTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600" /> Danger Zone
                </CardTitle>
                <CardDescription className="text-xs text-rose-600/80">
                  Export account data or permanently delete your account and associated feeds.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Export Data */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-rose-200/80 shadow-sm">
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
                    className="text-xs font-bold rounded-xl border-zinc-300 gap-1.5 hover:bg-zinc-50 cursor-pointer shrink-0"
                  >
                    <Download className="h-4 w-4 text-zinc-600" /> Export CSV
                  </Button>
                </div>

                {/* Delete Account */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-100/40 border border-rose-300/80">
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
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl gap-1.5 cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* 2FA SETUP MODAL */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 space-y-5 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setShow2FAModal(false)}
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

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
              <div className="h-40 w-40 bg-white rounded-xl border border-zinc-300 p-2 shadow-inner flex items-center justify-center">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/FeedMee:alexrivers?secret=JBSWY3DPEHPK3PXP"
                  alt="2FA QR Code"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-zinc-600 bg-white px-3 py-1 rounded-md border border-zinc-200">
                Secret: JBSW-Y3DP-EHPK-3PXP
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700">Enter 6-Digit Code from App</Label>
              <Input placeholder="123456" maxLength={6} className="text-center font-mono font-bold tracking-widest text-base rounded-xl" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShow2FAModal(false)} className="rounded-xl text-xs font-bold">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIs2FAEnabled(true);
                  setShow2FAModal(false);
                }}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"
              >
                Verify &amp; Activate 2FA
              </Button>
            </div>
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
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="rounded-xl text-xs font-bold">
                Cancel
              </Button>
              <Button
                disabled={deleteConfirmationText !== "DELETE"}
                onClick={() => {
                  alert("Account deletion request submitted.");
                  setShowDeleteModal(false);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Permanently Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
