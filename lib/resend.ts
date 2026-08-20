import { Resend } from "resend";
import { renderFreeWelcomeHtml } from "@/emails/free-welcome";
import { renderTrialStartedHtml } from "@/emails/trial-started";
import { renderSubscriptionActiveHtml } from "@/emails/subscription-active";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || "Feedm.ee <welcome@feedm.ee>";
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
      upgradeUrl: "https://feedm.ee/pricing",
    });

    let fromAddress = getFromAddress();
    let data;

    try {
      data = await resend.emails.send({
        from: fromAddress,
        to: [email],
        subject: "Welcome to Feed Me — Your Bio Page is Active",
        html,
      });
    } catch (sendErr: any) {
      if (sendErr.message?.toLowerCase().includes("domain") || sendErr.statusCode === 403) {
        data = await resend.emails.send({
          from: FALLBACK_FROM,
          to: [email],
          subject: "Welcome to Feed Me — Your Bio Page is Active",
          html,
        });
      } else {
        throw sendErr;
      }
    }

    console.log("[Resend Success]: Free Welcome Email dispatched successfully:", data);
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
        subject: "Welcome to Feed Me — Your 7-Day Pro Trial Has Started",
        html,
      });
    } catch (sendErr: any) {
      if (sendErr.message?.toLowerCase().includes("domain") || sendErr.statusCode === 403) {
        data = await resend.emails.send({
          from: FALLBACK_FROM,
          to: [email],
          subject: "Welcome to Feed Me — Your 7-Day Pro Trial Has Started",
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

export async function sendTrialDay5Email({
  email,
  name,
}: {
  email: string;
  name?: string;
}) {
  if (!resend) return { success: false, error: "RESEND_API_KEY missing" };

  try {
    const html = `
      <div style="font-family: Inter, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e5e7eb; padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 800; color: #09090b; margin: 0 0 16px;">How is your Feed Me page performing this week?</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">Hey ${name || "Creator"}, you have 2 days remaining on your 7-day Pro Trial. Log in to your Feed Me analytics dashboard to view your profile views, click-through rates, and video engagement metrics.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://feedm.ee/dashboard" style="background-color: #00BC7D; color: #ffffff; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 9999px; text-decoration: none; display: inline-block;">Check Your Analytics</a>
        </div>
      </div>
    `;

    const data = await resend.emails.send({
      from: getFromAddress(),
      to: [email],
      subject: "How is your Feed Me page performing this week?",
      html,
    });

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendTrialDay6WarningEmail({
  email,
  name,
  checkoutUrl = "https://feedm.ee/pricing",
}: {
  email: string;
  name?: string;
  checkoutUrl?: string;
}) {
  if (!resend) return { success: false, error: "RESEND_API_KEY missing" };

  try {
    const html = `
      <div style="font-family: Inter, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e5e7eb; padding: 32px;">
        <div style="display:inline-block; background-color: #fef2f2; color: #dc2626; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px;">24 Hours Remaining</div>
        <h2 style="font-size: 20px; font-weight: 800; color: #09090b; margin: 0 0 16px;">Your Pro Trial ends in 24 hours — Don't lose your video reels & analytics!</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">Hey ${name || "Creator"}, your 7-day Pro Trial is expiring tomorrow. Upgrade today for $7/mo to keep your 3 video reels, lead capture form, and custom domain active without interruption.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${checkoutUrl}" style="background-color: #00BC7D; color: #ffffff; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 9999px; text-decoration: none; display: inline-block;">Lock In Pro Plan ($7/mo)</a>
        </div>
      </div>
    `;

    const data = await resend.emails.send({
      from: getFromAddress(),
      to: [email],
      subject: "Your Pro Trial ends in 24 hours",
      html,
    });

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendTrialExpiredEmail({
  email,
  name,
  upgradeUrl = "https://feedm.ee/pricing",
}: {
  email: string;
  name?: string;
  upgradeUrl?: string;
}) {
  if (!resend) return { success: false, error: "RESEND_API_KEY missing" };

  try {
    const html = `
      <div style="font-family: Inter, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e5e7eb; padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 800; color: #09090b; margin: 0 0 16px;">Your Pro Trial has ended — Your Free account is active</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">Hey ${name || "Creator"}, your 7-day Pro Trial has completed and your account has transitioned to the Free Starter Plan. Your Single-Page Bio and custom links remain 100% active. You can upgrade back to Pro anytime to reactivate your video reels and lead forms.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${upgradeUrl}" style="background-color: #00BC7D; color: #ffffff; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 9999px; text-decoration: none; display: inline-block;">Reactivate Pro Features Anytime</a>
        </div>
      </div>
    `;

    const data = await resend.emails.send({
      from: getFromAddress(),
      to: [email],
      subject: "Your Pro Trial has ended — Account set to Free",
      html,
    });

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
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
        subject: `Payment Confirmed — Welcome to Feed Me ${planName}`,
        html,
      });
    } catch (sendErr: any) {
      if (sendErr.message?.toLowerCase().includes("domain") || sendErr.statusCode === 403) {
        data = await resend.emails.send({
          from: FALLBACK_FROM,
          to: [email],
          subject: `Payment Confirmed — Welcome to Feed Me ${planName}`,
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
          <p style="font-size: 13px; color: #71717a; margin-top: 6px;">Use this 6-digit code to complete your two-factor login to Feed Me</p>
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
        subject: `${code} is your Feed Me verification code`,
        html,
      });
    } catch (sendErr: any) {
      if (sendErr.message?.toLowerCase().includes("domain") || sendErr.statusCode === 403) {
        data = await resend.emails.send({
          from: FALLBACK_FROM,
          to: [email],
          subject: `${code} is your Feed Me verification code`,
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
