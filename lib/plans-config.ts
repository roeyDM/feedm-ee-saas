export type PlanTier = "free" | "personal" | "pro" | "business";

export interface PlanLimits {
  reelsPerFeed: number; // 0 for free, 3 for personal/pro/business
  leadsPerMonth: number; // 5 for free, 20 for personal, -1 for unlimited
  maxFeeds: number; // 1 for free/personal/pro, 5 for business
  maxSeats: number; // 1 for free/personal/pro, multi for business
}

export interface PlanFeatures {
  hasWatermarkRemoval: boolean;
  hasAdvancedThemes: boolean;
  hasCustomThemes: boolean;
  hasBasicAnalytics: boolean;
  hasFullAnalytics: boolean;
  hasVideoAnalytics: boolean;
  hasMarketingPixels: boolean;
  hasCustomLeadForms: boolean; // Currently false (In Dev)
  hasWhatsappLeadRoute: boolean; // Currently false (In Dev)
  hasApiWebhookAccess: boolean; // Currently false (In Dev)
}

export interface PlanConfig {
  name: string;
  tier: PlanTier;
  monthlyPriceUSD: number;
  yearlyPriceUSD: number;
  limits: PlanLimits;
  features: PlanFeatures;
}

export const PLANS_CONFIG: Record<PlanTier, PlanConfig> = {
  free: {
    name: "Starter Free",
    tier: "free",
    monthlyPriceUSD: 0,
    yearlyPriceUSD: 0,
    limits: {
      reelsPerFeed: 0,
      leadsPerMonth: 5,
      maxFeeds: 1,
      maxSeats: 1,
    },
    features: {
      hasWatermarkRemoval: false,
      hasAdvancedThemes: false,
      hasCustomThemes: false,
      hasBasicAnalytics: false,
      hasFullAnalytics: false,
      hasVideoAnalytics: false,
      hasMarketingPixels: false,
      hasCustomLeadForms: false,
      hasWhatsappLeadRoute: false,
      hasApiWebhookAccess: false,
    },
  },
  personal: {
    name: "Personal Creator",
    tier: "personal",
    monthlyPriceUSD: 4,
    yearlyPriceUSD: 39,
    limits: {
      reelsPerFeed: 3,
      leadsPerMonth: 20,
      maxFeeds: 1,
      maxSeats: 1,
    },
    features: {
      hasWatermarkRemoval: true,
      hasAdvancedThemes: true,
      hasCustomThemes: false,
      hasBasicAnalytics: true,
      hasFullAnalytics: false,
      hasVideoAnalytics: false,
      hasMarketingPixels: false,
      hasCustomLeadForms: false,
      hasWhatsappLeadRoute: false,
      hasApiWebhookAccess: false,
    },
  },
  pro: {
    name: "Pro Growth",
    tier: "pro",
    monthlyPriceUSD: 7,
    yearlyPriceUSD: 67,
    limits: {
      reelsPerFeed: 3,
      leadsPerMonth: -1, // Unlimited
      maxFeeds: 1,
      maxSeats: 1,
    },
    features: {
      hasWatermarkRemoval: true,
      hasAdvancedThemes: true,
      hasCustomThemes: false,
      hasBasicAnalytics: true,
      hasFullAnalytics: true,
      hasVideoAnalytics: true,
      hasMarketingPixels: true,
      hasCustomLeadForms: false,
      hasWhatsappLeadRoute: false,
      hasApiWebhookAccess: false,
    },
  },
  business: {
    name: "Business Agency",
    tier: "business",
    monthlyPriceUSD: 19,
    yearlyPriceUSD: 180,
    limits: {
      reelsPerFeed: 3,
      leadsPerMonth: -1, // Unlimited
      maxFeeds: 5,
      maxSeats: 5,
    },
    features: {
      hasWatermarkRemoval: true,
      hasAdvancedThemes: true,
      hasCustomThemes: true,
      hasBasicAnalytics: true,
      hasFullAnalytics: true,
      hasVideoAnalytics: true,
      hasMarketingPixels: true,
      hasCustomLeadForms: false,
      hasWhatsappLeadRoute: false,
      hasApiWebhookAccess: false,
    },
  },
};

/**
 * Helper function to retrieve feature config for a specific plan tier
 */
export function getPlanConfig(tier?: string | null): PlanConfig {
  const normalized = (tier || "free").toLowerCase() as PlanTier;
  return PLANS_CONFIG[normalized] || PLANS_CONFIG.free;
}
