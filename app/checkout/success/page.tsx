"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { pushToDataLayer } from "@/lib/gtm";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId =
    searchParams.get("order_id") ||
    searchParams.get("session_id") ||
    searchParams.get("transaction_id") ||
    `tx_${Date.now()}`;
  const planId = (searchParams.get("plan") || searchParams.get("plan_id") || "pro").toLowerCase();
  const rawTotal =
    searchParams.get("total") ||
    searchParams.get("value") ||
    (planId === "business" ? "29" : planId === "personal" ? "6" : "12");
  const orderTotal = Number(rawTotal) || 12;

  useEffect(() => {
    pushToDataLayer({
      event: "purchase_success",
      transaction_id: orderId,
      value: orderTotal,
      currency: "USD",
      plan_name: planId,
    });
  }, [orderId, orderTotal, planId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200/80 bg-white/95 p-8 sm:p-10 shadow-xl backdrop-blur-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-6 shadow-sm">
          <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>Payment Successful</span>
        </div>

        <h1 className="text-2xl font-black text-zinc-950 tracking-tight mb-2">
          Thank you for subscribing!
        </h1>
        <p className="text-sm font-medium text-zinc-600 mb-6">
          Your account has been upgraded. All Pro features are now unlocked on your creator profile.
        </p>

        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 mb-6 text-left text-xs space-y-2">
          <div className="flex justify-between text-zinc-500 font-semibold">
            <span>Transaction Reference:</span>
            <span className="font-mono text-zinc-800 font-bold truncate max-w-[180px]">{orderId}</span>
          </div>
          <div className="flex justify-between text-zinc-500 font-semibold">
            <span>Subscribed Plan:</span>
            <span className="capitalize font-bold text-emerald-700">{planId}</span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-sm font-black text-white shadow-md transition-all cursor-pointer"
        >
          <span>Go to Creator Studio</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading confirmation...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
