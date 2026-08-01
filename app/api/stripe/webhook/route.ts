import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    return NextResponse.json(
      { message: "Webhook received (Unverified environment mode)" },
      { status: 200 }
    );
  }

  let event: any;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle relevant event types
  try {
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status; // 'active', 'trialing', 'canceled', 'past_due'
        
        console.log(`Stripe Webhook: Subscription ${subscription.id} updated to status: ${status}`);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log(`Stripe Webhook: Subscription ${subscription.id} canceled.`);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        console.log(`Stripe Webhook: Payment succeeded for invoice ${invoice.id}`);
        break;
      }
      default:
        console.log(`Unhandled Stripe event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
