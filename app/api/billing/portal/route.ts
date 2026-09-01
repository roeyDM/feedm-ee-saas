import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  return generatePortalUrl(req);
}

export async function GET(req: Request) {
  return generatePortalUrl(req);
}

async function generatePortalUrl(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // We'll read the user id from the auth header, but since this is called from the client component,
    // we should really be authenticating the user via Next.js server-side auth or passing the token.
    // For this context, we will fetch the active session from the auth header if provided, 
    // or rely on the client passing the user ID securely.
    
    // Attempt to get user from auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch profile to get customer ID or subscription ID
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("lemon_squeezy_customer_id, lemon_squeezy_subscription_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const customerId = profile.lemon_squeezy_customer_id;
    const subscriptionId = profile.lemon_squeezy_subscription_id;

    if (!customerId && !subscriptionId) {
      return NextResponse.json({ url: "https://app.lemonsqueezy.com/my-orders" });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      console.warn("Missing LEMONSQUEEZY_API_KEY. Falling back to default URL.");
      return NextResponse.json({ url: "https://app.lemonsqueezy.com/my-orders" });
    }

    // Prefer customer endpoint if we have customer ID
    if (customerId) {
      const lsRes = await fetch(`https://api.lemonsqueezy.com/v1/customers/${customerId}`, {
        headers: {
          "Accept": "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          "Authorization": `Bearer ${apiKey}`
        }
      });
      
      if (lsRes.ok) {
        const lsData = await lsRes.json();
        const portalUrl = lsData?.data?.attributes?.urls?.customer_portal;
        if (portalUrl) {
          return NextResponse.json({ url: portalUrl });
        }
      }
    }

    // Fallback to subscription endpoint if we have subscription ID
    if (subscriptionId) {
      const lsRes = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
        headers: {
          "Accept": "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          "Authorization": `Bearer ${apiKey}`
        }
      });

      if (lsRes.ok) {
        const lsData = await lsRes.json();
        const portalUrl = lsData?.data?.attributes?.urls?.customer_portal;
        if (portalUrl) {
          return NextResponse.json({ url: portalUrl });
        }
      }
    }

    return NextResponse.json({ url: "https://app.lemonsqueezy.com/my-orders" });
  } catch (err: any) {
    console.error("[Billing Portal API Error]:", err);
    return NextResponse.json({ error: err.message || "Internal server error", url: "https://app.lemonsqueezy.com/my-orders" }, { status: 500 });
  }
}
