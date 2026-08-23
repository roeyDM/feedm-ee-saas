import { NextResponse } from "next/server";
import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { variantId, userId: bodyUserId } = body;

    if (!variantId) {
      return NextResponse.json({ error: "variantId is required" }, { status: 400 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY || process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID || process.env.LEMON_SQUEEZY_STORE_ID;

    if (!apiKey || !storeId) {
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

    // Create Lemon Squeezy Checkout
    const checkoutResponse = await createCheckout(storeId, String(variantId), {
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
      console.error("[Lemon Squeezy Checkout Error]:", checkoutResponse.error);
      return NextResponse.json(
        { error: checkoutResponse.error.message || "Failed to create Lemon Squeezy checkout" },
        { status: 500 }
      );
    }

    const checkoutUrl = checkoutResponse.data?.data?.attributes?.url;

    if (!checkoutUrl) {
      return NextResponse.json({ error: "Checkout URL not returned from Lemon Squeezy API" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl, success: true });
  } catch (err: any) {
    console.error("[Lemon Squeezy Checkout Exception]:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
