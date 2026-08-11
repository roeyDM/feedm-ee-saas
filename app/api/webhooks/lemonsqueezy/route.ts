import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature");
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[Lemon Squeezy Webhook Error]: LEMONSQUEEZY_WEBHOOK_SECRET is missing");
      return NextResponse.json({ error: "Webhook secret configuration error" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing x-signature header" }, { status: 400 });
    }

    // Verify HMAC SHA256 signature
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      console.warn("[Lemon Squeezy Webhook Warning]: Invalid signature verification");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data || {};
    const userId = customData.user_id;

    console.log(`[Lemon Squeezy Webhook Received]: Event "${eventName}" for user_id: "${userId || "none"}"`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_J2IgY8ZACubzebsuSlVqoQ_8rpGitwz";

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const attributes = payload.data?.attributes || {};
    const variantId = String(attributes.variant_id || "");
    const customerId = String(attributes.customer_id || "");
    const subscriptionId = String(payload.data?.id || attributes.subscription_id || "");

    // Determine target subscription tier based on variantId
    let tier: "free" | "personal" | "pro" | "business" = "personal";
    const personalVariants = [
      process.env.LEMONSQUEEZY_VARIANT_PERSONAL_MONTHLY || "1996051",
      process.env.LEMONSQUEEZY_VARIANT_PERSONAL_YEARLY || "1996076",
    ];
    const proVariants = [
      process.env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY || "1996077",
      process.env.LEMONSQUEEZY_VARIANT_PRO_YEARLY || "1996078",
    ];
    const businessVariants = [
      process.env.LEMONSQUEEZY_VARIANT_BUSINESS_MONTHLY || "1996082",
      process.env.LEMONSQUEEZY_VARIANT_BUSINESS_YEARLY || "1996084",
    ];

    if (businessVariants.includes(variantId)) {
      tier = "business";
    } else if (proVariants.includes(variantId)) {
      tier = "pro";
    } else if (personalVariants.includes(variantId)) {
      tier = "personal";
    }

    if (eventName === "subscription_created" || eventName === "subscription_updated") {
      const updateData: any = {
        plan_type: tier,
        subscription_status: "active",
        updated_at: new Date().toISOString(),
      };
      if (customerId) updateData.lemon_customer_id = customerId;
      if (subscriptionId) updateData.lemon_subscription_id = subscriptionId;

      if (userId) {
        const { error } = await supabase.from("profiles").update(updateData).eq("id", userId);
        if (error) {
          console.warn("[Lemon Squeezy Webhook DB Error]:", error.message);
        } else {
          console.log(`[Lemon Squeezy Webhook Success]: Updated user ${userId} to plan "${tier}"`);
          // Auto-unlock all pending locked leads upon upgrade to Pro/Business
          if (tier === "pro" || tier === "business") {
            const { error: unlockErr } = await supabase
              .from("leads")
              .update({ status: "active", updated_at: new Date().toISOString() })
              .eq("user_id", userId)
              .eq("status", "locked");

            if (unlockErr) {
              console.warn("[Lemon Squeezy Lead Auto-Unlock Error]:", unlockErr.message);
            } else {
              console.log(`[Lemon Squeezy Webhook Success]: Auto-unlocked locked leads for user ${userId}`);
            }
          }
        }
      } else {
        // Fallback: match profile by customer email if user_id is missing in custom_data
        const userEmail = attributes.user_email;
        if (userEmail) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", userEmail)
            .maybeSingle();

          const { error } = await supabase.from("profiles").update(updateData).eq("email", userEmail);
          if (error) {
            console.warn("[Lemon Squeezy Webhook Email DB Note]:", error.message);
          } else if (profile?.id && (tier === "pro" || tier === "business")) {
            await supabase
              .from("leads")
              .update({ status: "active", updated_at: new Date().toISOString() })
              .eq("user_id", profile.id)
              .eq("status", "locked");
            console.log(`[Lemon Squeezy Webhook Success]: Auto-unlocked locked leads for profile email ${userEmail}`);
          }
        }
      }
    } else if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
      const updateData = {
        plan_type: "free",
        subscription_status: "cancelled",
        updated_at: new Date().toISOString(),
      };

      if (userId) {
        await supabase.from("profiles").update(updateData).eq("id", userId);
        console.log(`[Lemon Squeezy Webhook Success]: Reset user ${userId} plan to "free" (cancelled)`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[Lemon Squeezy Webhook Handler Exception]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
