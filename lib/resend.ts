import { Resend } from "resend";
import { renderFreeWelcomeHtml } from "@/emails/free-welcome";
import { renderTrialStartedHtml } from "@/emails/trial-started";
import { renderSubscriptionActiveHtml } from "@/emails/subscription-active";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || "FeedM <welcome@feedm.ee>";
const FALLBACK_FROM = "onboarding@resend.dev";

function getFromAddress(): string {
  // If domain is unverified in testing, fallback to onboarding@resend.dev
  if (process.env.NODE_ENV === "development" && !process.env.RESEND_FROM_EMAIL) {
    return FALLBACK_FROM;
  }
  return DEFAULT_FROM;
}

export async function sendFreeWelcomeEmail({
  email,
  name,
}: {
  email: string;
  name?: string;
}) {
  if (!resend) {
    console.warn("[Resend Warning]: RESEND_API_KEY is missing. Free welcome email skipped.");
    return { success: false, error: "RESEND_API_KEY missing" };
  }

  try {
    const html = renderFreeWelcomeHtml({
      name: name || "Creator",
      loginUrl: "https://feedm.ee/dashboard",
    });

    const data = await resend.emails.send({
      from: getFromAddress(),
      to: [email],
      subject: "Welcome to FeedM — Your 5-Page Video Bio is Ready",
      html,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("[Resend Free Welcome Error]:", error);
    return { success: false, error: error.message || error };
  }
}

export async function sendTrialStartedEmail({
  email,
  name,
  planName = "Pro Plan",
  trialEndsAt,
}: {
  email: string;
  name?: string;
  planName?: string;
  trialEndsAt?: string;
}) {
  if (!resend) {
    console.warn("[Resend Warning]: RESEND_API_KEY is missing. Trial started email skipped.");
    return { success: false, error: "RESEND_API_KEY missing" };
  }

  try {
    const html = renderTrialStartedHtml({
      name: name || "Creator",
      planName,
      trialEndsAt: trialEndsAt || "7 days from today",
      dashboardUrl: "https://feedm.ee/dashboard",
    });

    const data = await resend.emails.send({
      from: getFromAddress(),
      to: [email],
      subject: `Welcome to Your 7-Day ${planName} Trial | FeedM`,
      html,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("[Resend Trial Started Error]:", error);
    return { success: false, error: error.message || error };
  }
}

export async function sendSubscriptionActiveEmail({
  email,
  name,
  planName = "Pro Plan",
  receiptUrl,
}: {
  email: string;
  name?: string;
  planName?: string;
  receiptUrl?: string;
}) {
  if (!resend) {
    console.warn("[Resend Warning]: RESEND_API_KEY is missing. Subscription active email skipped.");
    return { success: false, error: "RESEND_API_KEY missing" };
  }

  try {
    const html = renderSubscriptionActiveHtml({
      name: name || "Creator",
      planName,
      receiptUrl,
      dashboardUrl: "https://feedm.ee/dashboard",
    });

    const data = await resend.emails.send({
      from: getFromAddress(),
      to: [email],
      subject: `Payment Confirmed — Welcome to FeedM ${planName}`,
      html,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("[Resend Subscription Active Error]:", error);
    return { success: false, error: error.message || error };
  }
}
