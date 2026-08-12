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

export async function send2FAOtpEmail({
  email,
  code,
}: {
  email: string;
  code: string;
}) {
  if (!resend) {
    console.warn(`[Resend Warning]: RESEND_API_KEY missing. Simulated OTP for ${email}: ${code}`);
    return { success: true, simulated: true };
  }

  try {
    const html = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 24px; border: 1px solid #e4e4e7;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="font-size: 24px; font-weight: 900; color: #09090b; margin: 0;">Verification Code</h2>
          <p style="font-size: 13px; color: #71717a; margin-top: 6px;">Use this 6-digit code to complete your two-factor login to FeedM.ee</p>
        </div>
        <div style="background: #f4f4f5; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #7c3aed;">${code}</span>
        </div>
        <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin: 0;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;

    let fromAddress = getFromAddress();
    let data;

    try {
      data = await resend.emails.send({
        from: fromAddress,
        to: [email],
        subject: `${code} is your FeedM.ee verification code`,
        html,
      });
    } catch (sendErr: any) {
      if (sendErr.message?.toLowerCase().includes("domain") || sendErr.statusCode === 403) {
        data = await resend.emails.send({
          from: FALLBACK_FROM,
          to: [email],
          subject: `${code} is your FeedM.ee verification code`,
          html,
        });
      } else {
        throw sendErr;
      }
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("[Resend 2FA Email Error]:", error);
    return { success: false, error: error.message || error };
  }
}
