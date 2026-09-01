"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  PlanTier,
  PlanConfig,
  PlanLimits,
  PlanFeatures,
  PLANS_CONFIG,
  getPlanConfig,
  normalizePlanTier,
} from "@/lib/plans-config";

export function useFeatureAccess(initialPlanTier?: string | null) {
  const [currentPlan, setCurrentPlan] = useState<PlanTier>(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("feedmee_cached_plan_tier");
      if (cached) return normalizePlanTier(cached);
    }
    if (initialPlanTier) return normalizePlanTier(initialPlanTier);
    return "free";
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const fetchLatestProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[DEBUG Profile Context Error]: Query failed:", error);
      }

      if (!data && user.email) {
        const { data: dataByEmail, error: emailError } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();
        
        if (dataByEmail) {
          data = dataByEmail;
          error = emailError;
        }
      }

      if (data) {
        const normalizedPlan = (data?.plan || "free").toString().toUpperCase().trim();

        const rawPlan = normalizedPlan;
        const liveStatus = String(data?.payment_status || "unpaid").toLowerCase().trim();

        let normTier: PlanTier = "free";
        if (rawPlan === "PERSONAL") normTier = "personal";
        else if (rawPlan === "PRO") normTier = "pro";
        else if (rawPlan === "BUSINESS") normTier = "business";
        else normTier = "free";

        console.log("[DEBUG Normalized Plan]", { rawPlan, paymentStatus: liveStatus });

        if (typeof window !== "undefined") {
          sessionStorage.setItem("feedmee_cached_plan_tier", normTier);
        }

        setCurrentPlan(normTier);
      }
    } catch (err) {
      console.warn("[DEBUG Profile Context Warning]: Failed to refetch profile:", err);
    }
  };

  // Aggressive forced live query on mount, initialPlanTier change, and auth state change
  useEffect(() => {
    fetchLatestProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        fetchLatestProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialPlanTier]);

  const config: PlanConfig = isSuperAdmin
    ? PLANS_CONFIG.pro
    : getPlanConfig(currentPlan);

  const canAccess = (featureKey: keyof PlanFeatures): boolean => {
    if (isSuperAdmin) return true;
    return config.features[featureKey] === true;
  };

  const getPlanLimit = (limitKey: keyof PlanLimits): number => {
    if (isSuperAdmin) return -1;
    return config.limits[limitKey];
  };

  const isFeatureLocked = (featureKey: keyof PlanFeatures): boolean => {
    return !canAccess(featureKey);
  };

  return {
    currentPlan,
    config,
    isSuperAdmin,
    canAccess,
    getPlanLimit,
    isFeatureLocked,
    refetchProfile: fetchLatestProfile,
  };
}
