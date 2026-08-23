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

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUrl = `${origin}/dashboard?checkout=success`;

    console.log(`[Lemon Squeezy Checkout Attempt]: Store ID=${storeId}, Variant ID=${cleanVariantId}, User ID=${userId || "guest"}`);

    // Create Lemon Squeezy Checkout
    const checkoutResponse = await createCheckout(storeId, cleanVariantId, {
      checkoutData: {
        custom: {
          user_id: userId,
        },
      },
      productOptions: {
        redirectUrl,
      },
    });

    if (checkoutResponse.error) {
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
