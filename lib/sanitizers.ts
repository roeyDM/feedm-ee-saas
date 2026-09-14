export interface LeadFormSettings {
  title: string;
  subtitle: string;
  routeType: "email" | "whatsapp";
  target: string;
  phoneCountryCode?: string;
  phoneTarget?: string;
  showWhatsappButton?: boolean;
  showCallButton?: boolean;
  is_phone_required?: boolean;
  is_email_required?: boolean;
}

/**
 * Ensures any color input string is converted into a clean 6-digit HEX format (e.g. #16a34a).
 * Falls back to default fallback if invalid or modern CSS syntaxes (oklch, color-mix, var) are passed.
 */
export function sanitizeHexColor(color?: string | null, fallback = "#BAD1CB"): string {
  if (!color) return fallback.toUpperCase();
  let clean = color.trim();
  if (clean.startsWith("oklch") || clean.startsWith("color-mix") || clean.startsWith("var(")) {
    return fallback.toUpperCase();
  }
  if (!clean.startsWith("#")) {
    clean = `#${clean}`;
  }
  // Expand 3-digit hex like #abc -> #aabbcc
  if (/^#([0-9a-fA-F]{3})$/.test(clean)) {
    clean = `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  // Check if valid 6-digit hex
  if (/^#([0-9a-fA-F]{6})$/.test(clean)) {
    return clean.toUpperCase();
  }
  return fallback.toUpperCase();
}

/**
 * Pure utility to sanitize LeadForm settings.
 * This file is deliberately a server‑safe helper (no React imports, no 'use client').
 */
export function sanitizeLeadForm(lf?: Partial<LeadFormSettings> | null): LeadFormSettings {
  const DEFAULT_TITLE = "Get in Touch";
  const DEFAULT_SUBTITLE = "Leave your details below and we'll get back to you shortly.";

  const rawTitle = lf?.title?.trim() || "";
  const rawSubtitle = lf?.subtitle?.trim() || "";

  const isOldHebrewTitle =
    !rawTitle ||
    rawTitle.includes("רוצים להיות חלק") ||
    rawTitle.includes("לפניות עסקיות");

  const isOldHebrewSubtitle =
    !rawSubtitle ||
    rawSubtitle.includes("השאירו פרטים") ||
    rawSubtitle.includes("נחזור אליכם");

  const rawTarget = lf?.target?.trim() || "";
  const isInvalidEmailTarget = /^\d+$/.test(rawTarget) || (!rawTarget.includes("@") && rawTarget.length > 0);
  const cleanTarget = isInvalidEmailTarget ? "" : rawTarget;

  return {
    title: isOldHebrewTitle ? DEFAULT_TITLE : rawTitle,
    subtitle: isOldHebrewSubtitle ? DEFAULT_SUBTITLE : rawSubtitle,
    routeType: lf?.routeType || "email",
    target: cleanTarget,
    is_phone_required: lf?.is_phone_required,
    is_email_required: lf?.is_email_required,
    phoneCountryCode: lf?.phoneCountryCode || "1",
    phoneTarget: lf?.phoneTarget || "",
    showWhatsappButton: lf?.showWhatsappButton,
    showCallButton: lf?.showCallButton,
  };
}

export interface AppearanceSettingsData {
  bgType: "solid" | "gradient" | "image";
  bgColor: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  bgGradientAngle: number;
  bgImageUrl?: string;
  buttonShape: "sharp" | "rounded" | "pill" | "outline";
  fontFamily: string;
  avatarBorderEnabled?: boolean;
  avatarBorderColor?: string;
  avatarBorderWidth?: number;
  headlineColor?: string;
  bioColor?: string;
  cardBgColor?: string;
  cardTextColor?: string;
  cardBorderColor?: string;
  socialIconBgColor?: string;
  socialLogoMode?: "brand" | "flat";
  socialFlatColor?: string;
  hideBranding?: boolean;
}

export function buildAppearanceFromProfile(
  profile: any,
  fallback?: Partial<AppearanceSettingsData>
): AppearanceSettingsData {
  let bgGradientStart = fallback?.bgGradientStart || "#FBCFE8";
  let bgGradientEnd = fallback?.bgGradientEnd || "#E0F2FE";

  if (profile?.background_gradient && typeof profile.background_gradient === "string") {
    const match = profile.background_gradient.match(
      /linear-gradient\([^,]+,\s*(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|[a-z]+)\s*,\s*(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|[a-z]+)\)/i
    );
    if (match) {
      bgGradientStart = match[1];
      bgGradientEnd = match[2];
    }
  }

  const bgType: "solid" | "gradient" | "image" = profile?.background_image_url
    ? "image"
    : profile?.background_gradient &&
      profile.background_gradient.includes("linear-gradient") &&
      bgGradientStart.toLowerCase() !== bgGradientEnd.toLowerCase()
    ? "gradient"
    : (fallback?.bgType || "solid");

  const rawBgAngle = profile?.background_gradient_angle;
  const bgGradientAngle =
    rawBgAngle !== undefined && rawBgAngle !== null && !isNaN(Number(rawBgAngle))
      ? Number(rawBgAngle)
      : (fallback?.bgGradientAngle ?? 135);

  const rawBorderWidth = profile?.avatar_border_width;
  const avatarBorderWidth =
    rawBorderWidth !== undefined && rawBorderWidth !== null && !isNaN(Number(rawBorderWidth))
      ? Number(rawBorderWidth)
      : (fallback?.avatarBorderWidth ?? 4);

  const rawAvatarBorderEnabled = profile?.avatar_border_enabled;
  const avatarBorderEnabled =
    rawAvatarBorderEnabled !== undefined && rawAvatarBorderEnabled !== null
      ? Boolean(rawAvatarBorderEnabled)
      : (fallback?.avatarBorderEnabled ?? true);

  const themeColor = sanitizeHexColor(
    profile?.theme_color ||
      profile?.background_color ||
      profile?.custom_hex_color ||
      fallback?.bgColor,
    "#BAD1CB"
  );
  const buttonColor = sanitizeHexColor(
    profile?.button_color || fallback?.cardBgColor,
    "#16A34A"
  );
  const buttonTextColor = sanitizeHexColor(
    profile?.button_text_color || fallback?.cardTextColor,
    "#FFFFFF"
  );
  const textColor = sanitizeHexColor(
    profile?.text_color || fallback?.headlineColor,
    "#FFFFFF"
  );
  const bioColor = sanitizeHexColor(
    profile?.bio_color || fallback?.bioColor || textColor,
    textColor
  );
  const buttonBorderColor = sanitizeHexColor(
    profile?.button_border_color || fallback?.cardBorderColor || buttonColor,
    buttonColor
  );
  const avatarBorderColor = sanitizeHexColor(
    profile?.avatar_border_color || fallback?.avatarBorderColor || buttonColor,
    buttonColor
  );
  const socialPillColor = sanitizeHexColor(
    profile?.social_pill_color || fallback?.socialIconBgColor || buttonColor,
    buttonColor
  );
  const socialFlatColor = sanitizeHexColor(
    profile?.social_flat_color || fallback?.socialFlatColor || buttonTextColor,
    buttonTextColor
  );

  return {
    bgType,
    bgColor: themeColor,
    bgGradientStart: sanitizeHexColor(bgGradientStart, "#FBCFE8"),
    bgGradientEnd: sanitizeHexColor(bgGradientEnd, "#E0F2FE"),
    bgGradientAngle,
    bgImageUrl: profile?.background_image_url || fallback?.bgImageUrl || "",
    buttonShape: (profile?.button_shape as any) || fallback?.buttonShape || "rounded",
    fontFamily: profile?.font_family || fallback?.fontFamily || "Inter",
    avatarBorderEnabled,
    avatarBorderColor,
    avatarBorderWidth,
    headlineColor: textColor,
    bioColor,
    cardBgColor: buttonColor,
    cardTextColor: buttonTextColor,
    cardBorderColor: buttonBorderColor,
    socialIconBgColor: socialPillColor,
    socialLogoMode: (profile?.social_icon_mode as any) || fallback?.socialLogoMode || "brand",
    socialFlatColor,
    hideBranding: !!fallback?.hideBranding,
  };
}
