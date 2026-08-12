"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthSession() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (isMounted) {
          if (user && !error) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            const redirectUrl = `/login?redirectTo=${encodeURIComponent(pathname || "/dashboard")}`;
            router.push(redirectUrl);
          }
        }
      } catch (err) {
        console.warn("[DashboardLayout Auth Guard Error]:", err);
        if (isMounted) {
          setIsAuthenticated(false);
          router.push("/login?redirectTo=/dashboard");
        }
      }
    }

    checkAuthSession();

    // Listen to Auth State Changes (e.g. sign out from settings tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        if (isMounted) {
          setIsAuthenticated(false);
          router.push("/login?redirectTo=/dashboard");
        }
      } else if (session) {
        if (isMounted) {
          setIsAuthenticated(true);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  // Render a clean, lightweight loading spinner while checking auth session state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <span className="text-xs font-bold text-zinc-500">Loading Creator Studio...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated, show spinner while router.push completes redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 select-none">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-xs font-bold text-zinc-500">Redirecting to Sign In...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
