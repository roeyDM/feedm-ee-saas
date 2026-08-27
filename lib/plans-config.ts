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
  hasLeadsCrmExport: boolean;
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
  supportLevel: string;
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
      hasLeadsCrmExport: false,
      hasCustomLeadForms: false,
      hasWhatsappLeadRoute: false,
      hasApiWebhookAccess: false,
    },
    supportLevel: "Community",
  },
  personal: {
    name: "Personal Creator",
    tier: "personal",
    monthlyPriceUSD: 8,
    yearlyPriceUSD: 72,
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
      hasLeadsCrmExport: false,
      hasCustomLeadForms: false,
      hasWhatsappLeadRoute: false,
      hasApiWebhookAccess: false,
    },
    supportLevel: "Standard Email",
  },
  pro: {
    name: "Pro Growth",
    tier: "pro",
    monthlyPriceUSD: 15,
    yearlyPriceUSD: 144,
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
      hasLeadsCrmExport: true,
      hasCustomLeadForms: false,
      hasWhatsappLeadRoute: false,
      hasApiWebhookAccess: false,
    },
    supportLevel: "Priority Support",
  },
  business: {
    name: "Business Agency",
    tier: "business",
    monthlyPriceUSD: 35,
    yearlyPriceUSD: 348,
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
      hasLeadsCrmExport: true,
      hasCustomLeadForms: false,
      hasWhatsappLeadRoute: false,
      hasApiWebhookAccess: false,
    },
    supportLevel: "Priority Support",
  },
};

/**
 * Helper function to normalize plan string variations safely
 */
export function normalizePlanTier(rawInput?: string | null): PlanTier {
  if (!rawInput) return "free";
  const str = String(rawInput).toLowerCase().trim();

  if (
    str === "pro" ||
    str === "growth_pro" ||
    str === "growth pro" ||
    str === "pro_monthly" ||
    str === "pro_yearly" ||
    str === "pro_plan" ||
    str === "trial_pro" ||
    str.includes("pro")
  ) {
    return "pro";
  }

  if (
    str === "business" ||
    str === "enterprise" ||
    str === "business_agency" ||
    str.includes("business")
  ) {
    return "business";
  }

  if (
    str === "personal" ||
    str === "creator" ||
    str === "personal_creator" ||
    str === "personal_monthly" ||
    str === "personal_yearly" ||
    str.includes("personal") ||
    str.includes("creator")
  ) {
    return "personal";
  }

  return "free";
}

/**
 * Helper function to retrieve feature config for a specific plan tier
 */
export function getPlanConfig(tier?: string | null): PlanConfig {
  const normalized = normalizePlanTier(tier);
  return PLANS_CONFIG[normalized] || PLANS_CONFIG.free;
}

/**
 * Dynamic resolution map for LemonSqueezy Variant IDs across all plan types and billing intervals.
 * Supports standard, NEXT_PUBLIC, and Netlify environment variable naming conventions.
 */
export function getLemonSqueezyVariantId(
  planType?: string | null,
  interval: "monthly" | "yearly" = "monthly"
): string | null {
  const rawLower = String(planType || "").toLowerCase().trim();

  if (
    rawLower === "extra_feed" ||
    rawLower === "extra_feed_addon" ||
    rawLower === "extrafeed" ||
    rawLower === "addon" ||
    rawLower.includes("extra_feed")
  ) {
    if (interval === "yearly") {
      const val =
        process.env.NEXT_PUBLIC_LEMONSQUEEZY_EXTRA_FEED_YEARLY_VARIANT_ID ||
        process.env.LEMON_SQUEEZY_EXTRA_FEED_YEARLY_VARIANT_ID ||
        process.env.LEMONSQUEEZY_EXTRA_FEED_YEARLY_VARIANT_ID ||
        process.env.LEMONSQUEEZY_VARIANT_EXTRA_FEED_YEARLY;
      return val ? String(val).trim() : null;
    }
    const val =
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_EXTRA_FEED_MONTHLY_VARIANT_ID ||
      process.env.LEMON_SQUEEZY_EXTRA_FEED_MONTHLY_VARIANT_ID ||
      process.env.LEMONSQUEEZY_EXTRA_FEED_MONTHLY_VARIANT_ID ||
      process.env.LEMONSQUEEZY_VARIANT_EXTRA_FEED_MONTHLY;
    return val ? String(val).trim() : "1279130";
  }

  const normalizedPlan = normalizePlanTier(planType);

  if (normalizedPlan === "personal") {
    if (interval === "yearly") {
      const val =
        process.env.NEXT_PUBLIC_LEMONSQUEEZY_PERSONAL_YEARLY_VARIANT_ID ||
        process.env.LEMON_SQUEEZY_PERSONAL_YEARLY_VARIANT_ID ||
        process.env.LEMONSQUEEZY_PERSONAL_YEARLY_VARIANT_ID ||
        process.env.LEMONSQUEEZY_VARIANT_PERSONAL_YEARLY;
      return val ? String(val).trim() : "1996076";
    }
    const val =
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_PERSONAL_VARIANT_ID ||
      process.env.LEMON_SQUEEZY_PERSONAL_MONTHLY_VARIANT_ID ||
      process.env.LEMONSQUEEZY_PERSONAL_MONTHLY_VARIANT_ID ||
      process.env.LEMONSQUEEZY_VARIANT_PERSONAL_MONTHLY;
    return val ? String(val).trim() : "1996051";
  }

  if (normalizedPlan === "pro") {
    if (interval === "yearly") {
      const val =
        process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID ||
        process.env.LEMON_SQUEEZY_PRO_YEARLY_VARIANT_ID ||
        process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID ||
        process.env.LEMONSQUEEZY_VARIANT_PRO_YEARLY;
      return val ? String(val).trim() : "1996078";
    }
    const val =
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID ||
      process.env.LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID ||
      process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID ||
      process.env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY;
    return val ? String(val).trim() : "1996077";
  }

  if (normalizedPlan === "business") {
    if (interval === "yearly") {
      const val =
        process.env.NEXT_PUBLIC_LEMONSQUEEZY_BUSINESS_YEARLY_VARIANT_ID ||
        process.env.LEMON_SQUEEZY_BUSINESS_YEARLY_VARIANT_ID ||
        process.env.LEMONSQUEEZY_BUSINESS_YEARLY_VARIANT_ID ||
        process.env.LEMONSQUEEZY_VARIANT_BUSINESS_YEARLY;
      return val ? String(val).trim() : "1996084";
    }
    const val =
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_BUSINESS_VARIANT_ID ||
      process.env.LEMON_SQUEEZY_BUSINESS_MONTHLY_VARIANT_ID ||
      process.env.LEMONSQUEEZY_BUSINESS_MONTHLY_VARIANT_ID ||
      process.env.LEMONSQUEEZY_VARIANT_BUSINESS_MONTHLY;
    return val ? String(val).trim() : "1996082";
  }

  return "1996077";
}

/**
 * Helper to build Lemon Squeezy checkout URL ensuring proper path formation
 */
export function buildLemonSqueezyCheckoutUrl(variantId: string, userId?: string, planType?: string): string {
  const cleanId = String(variantId || "").trim();

  // Check explicit checkout URL env variables if configured
  if (planType === "personal" && process.env.NEXT_PUBLIC_LEMONSQUEEZY_PERSONAL_CHECKOUT_URL) {
    const directUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_PERSONAL_CHECKOUT_URL;
    return userId ? `${directUrl}?checkout[custom][user_id]=${encodeURIComponent(userId)}` : directUrl;
  }
  if (planType === "pro" && process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_CHECKOUT_URL) {
    const directUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_CHECKOUT_URL;
    return userId ? `${directUrl}?checkout[custom][user_id]=${encodeURIComponent(userId)}` : directUrl;
  }

  const rawDomain = (
    process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_DOMAIN ||
    process.env.LEMONSQUEEZY_STORE_URL ||
    "https://pay.feedm.ee"
  ).replace(/\/+$/, "");

  if (!cleanId) return rawDomain;

  // Standard path segment (/buy/)
  const basePath = rawDomain.includes("lemonsqueezy.com") ? "/buy" : "/buy";
  const baseUrl = rawDomain.endsWith("/buy") || rawDomain.endsWith("/checkout/buy") ? rawDomain : `${rawDomain}${basePath}`;
  const fullUrl = `${baseUrl.replace(/\/+$/, "")}/${cleanId}`;

  if (userId) {
    return `${fullUrl}?checkout[custom][user_id]=${encodeURIComponent(userId)}`;
  }
  return fullUrl;
}
