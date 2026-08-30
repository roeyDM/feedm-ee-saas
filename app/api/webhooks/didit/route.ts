import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventType = body.event || body.type || body.status || "";
    const vendorData = body.vendor_data || body.user_id || body.data?.vendor_data || "";
    const decision = body.decision || body.data?.decision || body.status || "";

    console.log("[Didit Webhook Received]:", { eventType, vendorData, decision });

    const isApproved =
      decision === "APPROVED" ||
      decision === "approved" ||
      eventType === "session.approved" ||
      eventType === "status.approved";

    if (isApproved && vendorData) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase
        .from("profiles")
        .update({
          verification_status: "VERIFIED",
          is_verified_badge_active: true,
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${vendorData},username.eq.${vendorData}`);

      console.log(`[Didit Webhook State Transition]: PAID_PENDING_KYC -> VERIFIED for user '${vendorData}'`);
      if (error) {
        console.error("[Didit Webhook DB Update Error]:", error);
      } else {
        console.log(`[Didit Webhook Success]: Profile '${vendorData}' marked as VERIFIED and is_verified_badge_active = true.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[Didit Webhook Exception]:", err);
    return NextResponse.json({ error: err.message || "Webhook error" }, { status: 500 });
  }
}
