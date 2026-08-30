"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SecondaryVerificationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/marketing-tools/verification");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700 text-xs font-bold">
      Redirecting to Verification...
    </div>
  );
}
