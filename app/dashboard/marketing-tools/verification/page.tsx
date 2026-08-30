"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerificationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard?tab=verification");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700 text-xs font-bold">
      Loading Verified Creator Badge Settings...
    </div>
  );
}
