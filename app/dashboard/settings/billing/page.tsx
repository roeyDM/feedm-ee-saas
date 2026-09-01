"use client";

import React, { useState, useEffect, Suspense } from "react";
import { BillingEditor } from "@/components/billing-editor";
import { PlanType, supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

function BillingSettingsContent() {
  const [planType, setPlanType] = useState<PlanType>("free");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, plan")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            if (profile.username) setUsername(profile.username);
            if (profile.plan) setPlanType(profile.plan.toLowerCase() as PlanType);
          }
        }
      } catch (err) {
        console.warn("[Billing Settings Load Note]:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <BillingSettingsContent />
    </Suspense>
  );
}
