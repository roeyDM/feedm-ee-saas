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
import { useProfileContext } from "@/context/profile-context";

export function useFeatureAccess(initialPlanTier?: string | null) {
  const profileContext = useProfileContext();

  // If inside ProfileProvider, return the context's fast cached values
  if (profileContext) {
    return {
      currentPlan: profileContext.currentPlan,
      config: profileContext.config,
      isSuperAdmin: profileContext.isSuperAdmin,
      canAccess: profileContext.canAccess,
      getPlanLimit: profileContext.getPlanLimit,
      isFeatureLocked: profileContext.isFeatureLocked,
      refetchProfile: profileContext.refetchProfile,
      profile: profileContext.profile,
      updateProfileCache: profileContext.updateProfileCache,
    };
  }

  // Fallback standalone implementation if called outside of ProfileProvider
  const [currentPlan, setCurrentPlan] = useState<PlanTier>(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("feedmee_cached_plan_tier");
      if (cached) return normalizePlanTier(cached);
    }
    if (initialPlanTier) return normalizePlanTier(initialPlanTier);
    return "free";
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const fetchLatestProfile = async (force = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!data && user.email) {
        const { data: dataByEmail } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();
        
        if (dataByEmail) {
          data = dataByEmail;
        }
      }

      if (data) {
        const rawPlan = (data?.plan || "free").toString().toUpperCase().trim();
        let normTier: PlanTier = "free";
        if (rawPlan === "PERSONAL") normTier = "personal";
        else if (rawPlan === "PRO") normTier = "pro";
        else if (rawPlan === "BUSINESS") normTier = "business";
        else normTier = "free";

        const isSuper = data.is_super_admin === true || rawPlan === "SUPER_ADMIN";

        if (typeof window !== "undefined") {
          sessionStorage.setItem("feedmee_cached_plan_tier", normTier);
        }

        setCurrentPlan(normTier);
        setIsSuperAdmin(isSuper);
        return data;
      }
      return null;
    } catch (err) {
      console.warn("[useFeatureAccess] Standalone fetch note:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchLatestProfile();
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
