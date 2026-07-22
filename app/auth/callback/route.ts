// app/auth/callback/route.ts
// Supabase OAuth / Magic Link callback handler
// Works on localhost AND on Netlify (uses request URL origin dynamically)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  // Use dynamic origin — works on localhost:3000 AND on Netlify production
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
