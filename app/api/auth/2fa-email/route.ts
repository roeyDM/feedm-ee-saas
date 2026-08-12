import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { send2FAOtpEmail } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, code } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // 1. Check Auth Session
    const authHeader = req.headers.get("authorization");
    let token = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let userId: string | null = null;
    let userEmail: string | null = null;
    let currentUserMetadata: any = {};

    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        userId = user.id;
        userEmail = user.email || null;
        currentUserMetadata = user.user_metadata || {};
      }
    }

    if (!userId || !userEmail) {
      // Fallback: check profile by email if passed in body
      if (body.email) {
        const cleanEmail = String(body.email).toLowerCase().trim();
        const { data: prof } = await supabaseAdmin
          .from("profiles")
          .select("id, email")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (prof) {
          userId = prof.id;
          userEmail = prof.email;
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId as string);
          if (userData?.user) {
            currentUserMetadata = userData.user.user_metadata || {};
          }
        }
      }
    }

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    // -------------------------------------------------------------
    // ACTION: VERIFY EMAIL OTP CODE
    // -------------------------------------------------------------
    if (action === "verify") {
      if (!code || String(code).trim().length < 6) {
        return NextResponse.json({ error: "Invalid 6-digit verification code." }, { status: 400 });
      }

      const inputCode = String(code).trim();
      const savedCode = currentUserMetadata.email_otp_code;
      const expiresAt = currentUserMetadata.email_otp_expires_at;

      const isExpired = !expiresAt || new Date(expiresAt) < new Date();

      if (!savedCode || savedCode !== inputCode || isExpired) {
        return NextResponse.json(
          { error: isExpired ? "Email verification code has expired. Please request a new one." : "Invalid email verification code. Please check your inbox and try again." },
          { status: 400 }
        );
      }

      // Clear code after successful verification
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...currentUserMetadata,
          email_otp_code: null,
          email_otp_expires_at: null,
        },
      }).catch(() => {});

      return NextResponse.json({ success: true, verified: true });
    }

    // -------------------------------------------------------------
    // ACTION: SEND EMAIL OTP CODE (DEFAULT)
    // -------------------------------------------------------------
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 1. Store hashed/code in user metadata
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...currentUserMetadata,
        email_otp_code: otpCode,
        email_otp_expires_at: expiresAt,
      },
    });

    // 2. Dispatch email via Resend / Supabase OTP fallback
    const emailResult = await send2FAOtpEmail({ email: userEmail, code: otpCode });

    // Also trigger Supabase OTP as fallback
    await supabaseAdmin.auth.signInWithOtp({
      email: userEmail,
      options: { shouldCreateUser: false },
    }).catch(() => {});

    console.log(`[2FA Email API]: OTP ${otpCode} sent to ${userEmail} (Resend Success: ${emailResult.success})`);

    return NextResponse.json({
      success: true,
      message: "A 6-digit verification code was sent to your email address.",
      email: userEmail,
    });
  } catch (err: any) {
    console.error("[2FA Email API Error]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
