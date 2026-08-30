import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendTrialStartedEmail, sendSubscriptionActiveEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[Lemon Squeezy Webhook Error]: LEMONSQUEEZY_WEBHOOK_SECRET is missing.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Verify HMAC SHA256 Signature
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (
      digest.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(digest, signatureBuffer)
    ) {
      console.error("[Lemon Squeezy Webhook Error]: Invalid signature.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data || {};
    const attributes = payload.data?.attributes || {};

    const userEmail = attributes.user_email || customData.user_email;
    const userName = attributes.user_name || customData.user_name || "Creator";
    const status = attributes.status; // 'on_trial', 'active', 'cancelled', 'expired', 'paused'
    const planName = attributes.product_name || "Pro Plan";
    const receiptUrl = attributes.urls?.receipt || "";
    const trialEndsAt = attributes.trial_ends_at
      ? new Date(attributes.trial_ends_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "7 days from today";

    console.log(`[Lemon Squeezy Webhook Received]: Event=${eventName}, Email=${userEmail}, Status=${status}`);

    const supabaseAdmin = getSupabaseAdmin();

    // Check for Verification Fee purchase ($14.99)
    const variantId = String(attributes.variant_id || customData.variant_id || payload.data?.attributes?.first_order_item?.variant_id || "");
    const verificationVariant = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VERIFICATION_VARIANT_ID || "451a2d31-b5ca-4b44-b84c-1122c42e2dd2";
    const isVerificationOrder = variantId === verificationVariant || variantId === "1323098" || variantId.includes("451a2d31");

    if (isVerificationOrder || eventName === "order_created") {
      console.log(`[Verification Webhook Event]: State transition UNVERIFIED -> PAID_PENDING_KYC for Email=${userEmail}`);
      if (userEmail && supabaseAdmin) {
        await supabaseAdmin
          .from("profiles")
          .update({
            verification_status: "PAID_PENDING_KYC",
            updated_at: new Date().toISOString(),
          })
          .eq("email", userEmail);
        console.log(`[Verification Webhook DB Success]: Updated verification_status = PAID_PENDING_KYC for '${userEmail}'`);
      }
    }

    if (eventName === "subscription_created") {
      if (status === "on_trial") {
        // 1. Send Trial Started Email
        if (userEmail) {
          await sendTrialStartedEmail({
            email: userEmail,
            name: userName,
            planName,
            trialEndsAt,
          });
        }

        // 2. Update Supabase Profile if matched
        if (userEmail && supabaseAdmin) {
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: "trialing",
              plan_type: planName.toLowerCase().includes("personal") ? "personal" : "pro",
              updated_at: new Date().toISOString(),
            })
            .eq("email", userEmail);
        }
      } else if (status === "active") {
        // Direct conversion or non-trial active sub
        if (userEmail) {
          await sendSubscriptionActiveEmail({
            email: userEmail,
            name: userName,
            planName,
            receiptUrl,
          });
        }

        if (userEmail && supabaseAdmin) {
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: "active",
              plan_type: planName.toLowerCase().includes("personal") ? "personal" : "pro",
              updated_at: new Date().toISOString(),
            })
            .eq("email", userEmail);
        }
      }
    } else if (eventName === "subscription_payment_success") {
      // Payment conversion after trial ends
      if (userEmail) {
        await sendSubscriptionActiveEmail({
          email: userEmail,
          name: userName,
          planName,
          receiptUrl,
        });
      }

      if (userEmail && supabaseAdmin) {
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("email", userEmail);
      }
    } else if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
      if (userEmail && supabaseAdmin) {
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "cancelled",
            plan_type: "free",
            updated_at: new Date().toISOString(),
          })
          .eq("email", userEmail);
      }
    }

    return NextResponse.json({ success: true, event: eventName });
  } catch (error: any) {
    console.error("[Lemon Squeezy Webhook Handler Exception]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
