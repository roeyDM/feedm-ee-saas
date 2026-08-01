import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json().catch(() => ({}));
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      // Graceful fallback for local development without secret key
      return NextResponse.json({
        url: `${origin}/dashboard?portal=demo_notice`,
        isDemo: true,
        message: "Stripe Billing Portal is ready for production. Add STRIPE_SECRET_KEY to enable live portal redirects."
      });
    }

    const stripe = getStripe();

    // If customer ID is provided, create a portal session for that customer.
    // Otherwise, create a mock customer or fallback url.
    let activeCustomerId = customerId;
    if (!activeCustomerId) {
      const customer = await stripe.customers.create({
        description: "FeedM.ee Subscriber",
      });
      activeCustomerId = customer.id;
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: activeCustomerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error("Stripe Portal Error:", err);
    return NextResponse.json(
      { error: "Failed to create portal session", message: err.message },
      { status: 500 }
    );
  }
}
