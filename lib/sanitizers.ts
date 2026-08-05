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
