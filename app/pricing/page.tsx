import { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { PricingPreview } from "@/components/pricing-preview";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Pricing & Subscription Plans | Feedme",
  description: "Simple, transparent pricing for content creators, influencers, and visual brands.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-emerald-50/30 to-sky-50/40 text-zinc-900 font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar />
      <main>
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading pricing...</div>}>
          <PricingPreview />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
