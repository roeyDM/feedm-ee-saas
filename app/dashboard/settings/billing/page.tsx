"use client";

import React, { useState, useEffect, Suspense } from "react";
import { BillingEditor } from "@/components/billing-editor";
import { PlanType } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useProfileContext } from "@/context/profile-context";

function BillingSettingsContent() {
  const profileContext = useProfileContext();
  const [planType, setPlanType] = useState<PlanType>(() => {
    return (profileContext?.currentPlan || "free") as PlanType;
  });
  const [username, setUsername] = useState(() => profileContext?.profile?.username || "");

  useEffect(() => {
    if (profileContext?.profile) {
      if (profileContext.profile.username) setUsername(profileContext.profile.username);
      if (profileContext.currentPlan) setPlanType(profileContext.currentPlan as PlanType);
    }
  }, [profileContext?.profile, profileContext?.currentPlan]);

  return (
    <div className="min-h-screen bg-zinc-50/50 p-6 md:p-10">
      <BillingEditor
        planType={planType}
        setPlanType={setPlanType}
        username={username}
      />
    </div>
  );
}

export default function BillingSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <BillingSettingsContent />
    </Suspense>
  );
}
