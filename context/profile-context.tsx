"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
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

export interface ProfileData {
  id: string;
  email?: string | null;
  username?: string | null;
  name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  plan?: string | null;
  payment_status?: string | null;
  billing_interval?: string | null;
  next_billing_at?: string | null;
  subscription_start_at?: string | null;
  trial_ends_at?: string | null;
  onboarding_completed?: boolean | null;
  social_links?: any;
  custom_links?: any;
  reels?: any;
  lead_form?: any;
  appearance?: any;
  card_brand?: string | null;
  card_last_four?: string | null;
  lemon_squeezy_customer_id?: string | null;
  lemon_squeezy_subscription_id?: string | null;
  [key: string]: any;
}

interface ProfileContextType {
  profile: ProfileData | null;
  currentPlan: PlanTier;
  isSuperAdmin: boolean;
  loading: boolean;
  config: PlanConfig;
  canAccess: (featureKey: keyof PlanFeatures) => boolean;
  getPlanLimit: (limitKey: keyof PlanLimits) => number;
  isFeatureLocked: (featureKey: keyof PlanFeatures) => boolean;
  refetchProfile: (force?: boolean) => Promise<ProfileData | null>;
  updateProfileCache: (partial: Partial<ProfileData>) => void;
  invalidateCache: () => void;
}

// Module-level in-memory singleton cache to share across instances and route changes
let memoryCache: {
  profile: ProfileData | null;
  currentPlan: PlanTier;
  isSuperAdmin: boolean;
  timestamp: number;
  inFlightPromise: Promise<ProfileData | null> | null;
} = {
  profile: null,
  currentPlan: "free",
  isSuperAdmin: false,
  timestamp: 0,
  inFlightPromise: null,
};

const CACHE_TTL_MS = 60_000; // 60 seconds stale-while-revalidate TTL

export const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({
  children,
  initialPlanTier,
}: {
  children: React.ReactNode;
  initialPlanTier?: string | null;
}) {
  const [profile, setProfile] = useState<ProfileData | null>(() => memoryCache.profile);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>(() => {
    if (memoryCache.profile) return memoryCache.currentPlan;
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("feedmee_cached_plan_tier");
      if (cached) return normalizePlanTier(cached);
    }
    if (initialPlanTier) return normalizePlanTier(initialPlanTier);
    return "free";
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => memoryCache.isSuperAdmin);
  const [loading, setLoading] = useState<boolean>(() => !memoryCache.profile);

  const fetchProfileData = useCallback(async (force = false): Promise<ProfileData | null> => {
    const now = Date.now();

    // 1. SWR Cache check: If fresh and not forced, return in-memory cache instantly (0 network calls)
    if (!force && memoryCache.profile && now - memoryCache.timestamp < CACHE_TTL_MS) {
      setProfile(memoryCache.profile);
      setCurrentPlan(memoryCache.currentPlan);
      setIsSuperAdmin(memoryCache.isSuperAdmin);
      setLoading(false);
      return memoryCache.profile;
    }

    // 2. In-flight request deduplication
    if (memoryCache.inFlightPromise) {
      return memoryCache.inFlightPromise;
    }

    memoryCache.inFlightPromise = (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return null;
        }

        let { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.warn("[ProfileContext] ID query failed, trying email fallback:", error);
        }

        if (!data && user.email) {
          const { data: dataByEmail, error: emailError } = await supabase
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

          // Update in-memory singleton
          memoryCache = {
            profile: data as ProfileData,
            currentPlan: normTier,
            isSuperAdmin: isSuper,
            timestamp: Date.now(),
            inFlightPromise: null,
          };

          if (typeof window !== "undefined") {
            sessionStorage.setItem("feedmee_cached_plan_tier", normTier);
          }

          setProfile(data as ProfileData);
          setCurrentPlan(normTier);
          setIsSuperAdmin(isSuper);
          setLoading(false);
          return data as ProfileData;
        }

        return null;
      } catch (err) {
        console.warn("[ProfileContext] Fetch exception:", err);
        return null;
      } finally {
        memoryCache.inFlightPromise = null;
        setLoading(false);
      }
    })();

    return memoryCache.inFlightPromise;
  }, []);

  // Update in-memory cache optimistically
  const updateProfileCache = useCallback((partial: Partial<ProfileData>) => {
    setProfile((prev) => {
      const updated = prev ? { ...prev, ...partial } : (partial as ProfileData);
      
      let normTier = memoryCache.currentPlan;
      if (partial.plan) {
        normTier = normalizePlanTier(partial.plan);
      }

      memoryCache = {
        ...memoryCache,
        profile: updated,
        currentPlan: normTier,
        timestamp: Date.now(),
      };

      if (partial.plan) {
        setCurrentPlan(normTier);
      }

      return updated;
    });
  }, []);

  const invalidateCache = useCallback(() => {
    memoryCache.timestamp = 0;
  }, []);

  useEffect(() => {
    // Initial fetch on mount (uses cache if available)
    fetchProfileData(false);

    // Re-validate only on major auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
        fetchProfileData(true);
      } else if (event === "SIGNED_OUT") {
        memoryCache = {
          profile: null,
          currentPlan: "free",
          isSuperAdmin: false,
          timestamp: 0,
          inFlightPromise: null,
        };
        setProfile(null);
        setCurrentPlan("free");
        setIsSuperAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfileData]);

  const config: PlanConfig = isSuperAdmin
    ? PLANS_CONFIG.pro
    : getPlanConfig(currentPlan);

  const canAccess = useCallback(
    (featureKey: keyof PlanFeatures): boolean => {
      if (isSuperAdmin) return true;
      return config.features[featureKey] === true;
    },
    [isSuperAdmin, config]
  );

  const getPlanLimit = useCallback(
    (limitKey: keyof PlanLimits): number => {
      if (isSuperAdmin) return -1;
      return config.limits[limitKey];
    },
    [isSuperAdmin, config]
  );

  const isFeatureLocked = useCallback(
    (featureKey: keyof PlanFeatures): boolean => {
      return !canAccess(featureKey);
    },
    [canAccess]
  );

  const value: ProfileContextType = {
    profile,
    currentPlan,
    isSuperAdmin,
    loading,
    config,
    canAccess,
    getPlanLimit,
    isFeatureLocked,
    refetchProfile: fetchProfileData,
    updateProfileCache,
    invalidateCache,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileContext() {
  const ctx = useContext(ProfileContext);
  return ctx;
}
