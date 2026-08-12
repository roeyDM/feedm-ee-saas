import { Resend } from "resend";
import { renderFreeWelcomeHtml } from "@/emails/free-welcome";
import { renderTrialStartedHtml } from "@/emails/trial-started";
import { renderSubscriptionActiveHtml } from "@/emails/subscription-active";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || "FeedM <welcome@feedm.ee>";
const FALLBACK_FROM = "onboarding@resend.dev";

function getFromAddress(): string {
  if (process.env.NODE_ENV === "development" && !process.env.RESEND_FROM_EMAIL) {
    return FALLBACK_FROM;
  }
  return DEFAULT_FROM;
}

export async function sendFreeWelcomeEmail({
  email,
  name,
  handle,
}: {
  email: string;
  name?: string;
  handle?: string;
}) {
  if (!resend) {
    console.warn("[Resend Warning]: RESEND_API_KEY is missing. Free welcome email skipped.");
    return { success: false, error: "RESEND_API_KEY missing" };
  }

  console.log(`[Resend] Sending Welcome Email to: ${email} (Name: ${name || "Creator"}, Handle: @${handle || "creator"})`);

  try {
    const html = renderFreeWelcomeHtml({
      name: name || "Creator",
      loginUrl: "https://feedm.ee/dashboard",
    });

    let fromAddress = getFromAddress();
    let data;

    try {
      data = await resend.emails.send({
        from: fromAddress,
        to: [email],
        subject: "Welcome to FeedM — Your 5-Page Video Bio is Ready",
        html,
      });
    } catch (sendErr: any) {
      if (sendErr.message?.toLowerCase().includes("domain") || sendErr.statusCode === 403) {
        console.warn(`[Resend Warning]: Primary sender '${fromAddress}' failed domain check. Retrying with '${FALLBACK_FROM}'...`);
        data = await resend.emails.send({
          from: FALLBACK_FROM,
          to: [email],
          subject: "Welcome to FeedM — Your 5-Page Video Bio is Ready",
          html,
        });
      } else {
        throw sendErr;
      }
    }

    console.log("[Resend Success]: Welcome Email dispatched successfully:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("[Resend Error]: Failed to dispatch welcome email:", error);
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

  console.log(`[Resend] Sending Trial Started Email to: ${email} (Plan: ${planName})`);

  try {
    const html = renderTrialStartedHtml({
      name: name || "Creator",
      planName,
      trialEndsAt: trialEndsAt || "7 days from today",
      dashboardUrl: "https://feedm.ee/dashboard",
    });

    let fromAddress = getFromAddress();
    let data;

    try {
      data = await resend.emails.send({
        from: fromAddress,
        to: [email],
        subject: `Welcome to Your 7-Day ${planName} Trial | FeedM`,
        html,
      });
    } catch (sendErr: any) {
      if (sendErr.message?.toLowerCase().includes("domain") || sendErr.statusCode === 403) {
        console.warn(`[Resend Warning]: Primary sender '${fromAddress}' failed domain check. Retrying with '${FALLBACK_FROM}'...`);
        data = await resend.emails.send({
          from: FALLBACK_FROM,
          to: [email],
          subject: `Welcome to Your 7-Day ${planName} Trial | FeedM`,
          html,
        });
      } else {
        throw sendErr;
      }
    }

    console.log("[Resend Success]: Trial Started Email dispatched successfully:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("[Resend Error]: Failed to dispatch trial started email:", error);
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

  console.log(`[Resend] Sending Subscription Active Email to: ${email} (Plan: ${planName})`);

  try {
    const html = renderSubscriptionActiveHtml({
      name: name || "Creator",
      planName,
      receiptUrl,
      dashboardUrl: "https://feedm.ee/dashboard",
    });

    let fromAddress = getFromAddress();
    let data;

    try {
      data = await resend.emails.send({
        from: fromAddress,
        to: [email],
        subject: `Payment Confirmed — Welcome to FeedM ${planName}`,
        html,
      });
    } catch (sendErr: any) {
      if (sendErr.message?.toLowerCase().includes("domain") || sendErr.statusCode === 403) {
        console.warn(`[Resend Warning]: Primary sender '${fromAddress}' failed domain check. Retrying with '${FALLBACK_FROM}'...`);
        data = await resend.emails.send({
          from: FALLBACK_FROM,
          to: [email],
          subject: `Payment Confirmed — Welcome to FeedM ${planName}`,
          html,
        });
      } else {
        throw sendErr;
      }
    }

    console.log("[Resend Success]: Subscription Active Email dispatched successfully:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("[Resend Error]: Failed to dispatch subscription active email:", error);
    return { success: false, error: error.message || error };
  }
}
