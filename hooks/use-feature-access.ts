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
} from "@/lib/plans-config";

export function useFeatureAccess(initialPlanTier?: string | null) {
  const [currentPlan, setCurrentPlan] = useState<PlanTier>(() => {
    const norm = (initialPlanTier || "free").toLowerCase() as PlanTier;
    return PLANS_CONFIG[norm] ? norm : "free";
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    async function loadUserPlan() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("plan, plan_type, is_trial, is_super_admin")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          if (profile.is_super_admin === true) {
            setIsSuperAdmin(true);
            setCurrentPlan("pro");
            return;
          }

          const rawPlan = String(profile.plan_type || profile.plan || "free").toLowerCase();
          const normTier = (PLANS_CONFIG[rawPlan as PlanTier] ? rawPlan : "free") as PlanTier;
          setCurrentPlan(normTier);
        }
      } catch (err) {
        console.warn("[useFeatureAccess Warning]: Failed to fetch profile plan:", err);
      }
    }

    if (!initialPlanTier) {
      loadUserPlan();
    }
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
  };
}
