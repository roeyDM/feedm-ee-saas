import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getLemonSqueezyVariantId, buildLemonSqueezyCheckoutUrl } from "@/lib/plans-config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, targetPlan, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized JWT" }, { status: 401 });
    }

    const finalUserId = userId || user.id;

    const { data: profile, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("lemon_squeezy_subscription_id, plan")
      .eq("id", finalUserId)
      .maybeSingle();

    if (profErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const subscriptionId = profile.lemon_squeezy_subscription_id;

    if (action === "downgrade" && subscriptionId) {
      const apiKey = process.env.LEMONSQUEEZY_API_KEY;
      if (!apiKey) {
        throw new Error("Missing Lemon Squeezy API key");
      }

      const variantId = getLemonSqueezyVariantId(targetPlan, "monthly");
      
      const lsRes = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: {
          "Accept": "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          data: {
            type: "subscriptions",
            id: subscriptionId.toString(),
            attributes: {
              variant_id: variantId ? parseInt(variantId) : undefined,
              disable_prorations: true // standard for downgrade
            }
          }
        })
      });

      if (!lsRes.ok) {
        const errorData = await lsRes.json();
        console.error("Lemon Squeezy Downgrade Error:", errorData);
        throw new Error("Failed to downgrade subscription in Lemon Squeezy");
      }
    }

    // Update the profile plan in Supabase
    await supabaseAdmin
      .from("profiles")
      .update({ plan: targetPlan })
      .eq("id", finalUserId);
    
    return NextResponse.json({ success: true, message: "Plan successfully changed." });
  } catch (error: any) {
    console.error("[Change Plan Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

