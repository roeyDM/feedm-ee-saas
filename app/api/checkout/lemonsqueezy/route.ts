import { NextResponse } from "next/server";
import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { createClient } from "@supabase/supabase-js";
import { getLemonSqueezyVariantId } from "@/lib/plans-config";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { variantId: bodyVariantId, planType: inputPlan, plan, billingInterval: inputInterval, billingCycle, cycle, userId: bodyUserId } = body;

    const targetPlan = inputPlan || plan || "pro";
    const targetInterval = (inputInterval || billingCycle || cycle || "monthly") as "monthly" | "yearly";

    // Dynamically resolve variant ID from server environment variables if not provided or empty
    let variantId = bodyVariantId ? String(bodyVariantId).trim() : "";
    if (!variantId || variantId === "undefined" || variantId === "null") {
      const resolved = getLemonSqueezyVariantId(targetPlan, targetInterval);
      if (resolved) {
        variantId = resolved;
      }
    }

    if (!variantId) {
      console.error(`[Lemon Squeezy Checkout Abort]: Missing Variant ID for plan='${targetPlan}', interval='${targetInterval}' in environment variables.`);
      return NextResponse.json(
        { error: "Plan variant configuration missing in Netlify" },
        { status: 400 }
      );
    }

    const apiKey = (process.env.LEMONSQUEEZY_API_KEY || process.env.LEMON_SQUEEZY_API_KEY || "").trim();
    const storeId = (process.env.LEMONSQUEEZY_STORE_ID || process.env.LEMON_SQUEEZY_STORE_ID || "").trim();
    const cleanVariantId = variantId;

    if (!apiKey || !storeId) {
      console.error("[Lemon Squeezy Config Error]: Missing API Key or Store ID in environment variables.", { apiKeyPresent: !!apiKey, storeIdPresent: !!storeId });
      return NextResponse.json(
        { error: "Lemon Squeezy API Key or Store ID is missing in environment variables" },
        { status: 500 }
      );
    }

    // Initialize Lemon Squeezy SDK
    lemonSqueezySetup({ apiKey });

    // Look up active user from Supabase if possible
    let userId: string = bodyUserId || "";
    const authHeader = req.headers.get("Authorization");
    if (authHeader && !userId) {
      const token = authHeader.replace("Bearer ", "");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_J2IgY8ZACubzebsuSlVqoQ_8rpGitwz";
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    // Server-side gate: Restrict Extra Feed Add-ons exclusively to Pro and Business plan subscribers
    const isExtraFeedAddon =
      targetPlan === "extra_feed" ||
      targetPlan === "extra_feed_addon" ||
      targetPlan === "extrafeed" ||
      targetPlan === "addon" ||
      String(targetPlan).includes("extra_feed");

    if (isExtraFeedAddon) {
      let isEligibleUser = false;
      let profileData: any = null;
      let subscriptionRecord: any = null;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_J2IgY8ZACubzebsuSlVqoQ_8rpGitwz";
      const supabase = createClient(supabaseUrl, supabaseKey);

      const userEmail = (body.userEmail || body.email) ? String(body.userEmail || body.email).toLowerCase().trim() : "";
      const rawUsername = (body.username) ? String(body.username).trim() : "";

      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan_type, plan, tier, is_super_admin, is_trial, subscription_status, username, email")
          .eq("id", userId)
          .maybeSingle();

        profileData = profile;
      }

      if (!profileData && userEmail) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan_type, plan, tier, is_super_admin, is_trial, subscription_status, username, email")
          .eq("email", userEmail)
          .maybeSingle();

        profileData = profile;
      }

      if (!profileData && rawUsername) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan_type, plan, tier, is_super_admin, is_trial, subscription_status, username, email")
          .eq("username", rawUsername)
          .maybeSingle();

        profileData = profile;
      }

      // Check subscriptions table as well if available
      try {
        if (userId) {
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("status, plan_name, variant_id")
            .eq("user_id", userId)
            .maybeSingle();
          subscriptionRecord = sub;
        } else if (userEmail) {
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("status, plan_name, variant_id")
            .eq("email", userEmail)
            .maybeSingle();
          subscriptionRecord = sub;
        }
      } catch (err) {
        // Ignored if subscriptions table does not exist
      }

      const plan = (profileData?.plan || profileData?.plan_type || profileData?.tier || profileData?.subscription_status || subscriptionRecord?.plan_name || "").toLowerCase();
      const status = (profileData?.subscription_status || subscriptionRecord?.status || "").toLowerCase();

      console.log("[Checkout API Debug] Querying profile by email/username - Email:", userEmail, "| Username:", rawUsername, "| Resolved Plan:", plan, "| Status:", status);

      if (
        plan.includes("pro") ||
        plan.includes("business") ||
        plan.includes("agency") ||
        plan.includes("active") ||
        plan === "active" ||
        status === "active" ||
        status === "trialing" ||
        status === "on_trial" ||
        profileData?.is_super_admin === true ||
        profileData?.is_trial === true ||
        !!subscriptionRecord ||
        (!!profileData && status !== "canceled" && status !== "expired")
      ) {
        isEligibleUser = true;
      }

      if (!isEligibleUser) {
        console.log("[Checkout API] Access denied. Resolved plan was:", plan);
        return NextResponse.json(
          { error: "Extra Feed Add-ons are exclusively available for Pro and Business subscribers." },
          { status: 403 }
        );
      }
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUrl = `${origin}/dashboard?checkout=success`;

    const formattedStoreId = String(storeId).trim();
    const formattedVariantId = String(cleanVariantId).trim();

    // Force string sanitization for user_id to ensure it is ALWAYS a valid non-empty string
    const sanitizedUserId = String(userId || bodyUserId || `anon_${Date.now()}`);

    const customData: Record<string, string> = {
      user_id: String(sanitizedUserId),
      plan_type: String(targetPlan),
      billing_interval: String(targetInterval),
    };

    console.log(`[Lemon Squeezy Checkout Attempt]: Store ID=${formattedStoreId}, Variant ID=${formattedVariantId}, CustomData=`, customData);

    // Create Lemon Squeezy Checkout
    const checkoutResponse = await createCheckout(formattedStoreId, formattedVariantId, {
      checkoutData: {
        custom: customData,
      },
      productOptions: {
        redirectUrl,
      },
    });

    if (checkoutResponse.error) {
      console.error("[Lemon Squeezy Full Response Error]:", JSON.stringify(checkoutResponse, null, 2));
      const errorObj = checkoutResponse.error;
      const errorMessage = errorObj.message || "Failed to create Lemon Squeezy checkout";
      const errorCause = (errorObj as any).cause || (errorObj as any).errors || JSON.stringify(errorObj);

      console.error("[Lemon Squeezy Checkout Error Details]:", {
        storeId,
        variantId: cleanVariantId,
        message: errorMessage,
        cause: errorCause,
        rawError: errorObj,
      });

      const isVariantError =
        errorMessage.toLowerCase().includes("variant") ||
        errorMessage.toLowerCase().includes("unprocessable") ||
        errorMessage.includes("422") ||
        JSON.stringify(errorCause).toLowerCase().includes("variant");

      const userFacingError = isVariantError
        ? `Invalid LemonSqueezy Variant ID (${cleanVariantId}) for Store (${storeId}). Please check store configuration.`
        : errorMessage;

      return NextResponse.json(
        { error: userFacingError, details: errorCause },
        { status: 422 }
      );
    }

    const checkoutUrl = checkoutResponse.data?.data?.attributes?.url;

    if (!checkoutUrl) {
      console.error("[Lemon Squeezy Checkout Error]: URL not returned from Lemon Squeezy response", checkoutResponse);
      return NextResponse.json({ error: "Checkout URL not returned from Lemon Squeezy API" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl, success: true });
  } catch (err: any) {
    console.error("[Lemon Squeezy Checkout Exception]:", err?.response?.data || err?.message || err);
    const errString = JSON.stringify(err?.response?.data || err?.message || err);
    const isVariantError = errString.toLowerCase().includes("variant") || errString.includes("422");
    const userFacingError = isVariantError
      ? `Invalid LemonSqueezy Variant ID. Please check store configuration.`
      : (err.message || "Internal server error");

    return NextResponse.json(
      { error: userFacingError, details: err?.response?.data || err?.message },
      { status: 500 }
    );
  }
}
