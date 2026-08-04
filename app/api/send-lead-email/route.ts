import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetEmail = body.targetEmail || body.target_email || "";
    const fullName = body.fullName || body.name || "";
    const feedId = body.feedId || body.feedName || body.username || "";
    const email = body.email || "";
    const phone = body.phone || "";

    if (!targetEmail || typeof targetEmail !== "string" || !targetEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Invalid target recipient email address" },
        { status: 400 }
      );
    }

    // 1. Attempt to save lead entry to Supabase
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("leads").insert([
        {
          username: feedId || "unknown",
          feed_id: feedId || "unknown",
          target_email: targetEmail,
          full_name: fullName,
          email: email,
          phone: phone,
          created_at: new Date().toISOString(),
        },
      ]);
      console.log("[Supabase Lead Insert]: Successfully logged lead to database");
    } catch (dbErr) {
      console.warn("[Supabase Lead Insert Note]:", dbErr);
    }

    // 2. Read Server API Key with hardened fallback (process.env.RESEND_API_KEY -> process.env.NEXT_PUBLIC_RESEND_API_KEY -> process.env.LEAD_EMAIL_API_KEY)
    const apiKey =
      process.env.RESEND_API_KEY ||
      process.env.NEXT_PUBLIC_RESEND_API_KEY ||
      process.env.LEAD_EMAIL_API_KEY;

    console.log("[Resend Key Status]:", !!apiKey, apiKey ? `Key length: ${apiKey.length}` : "No key found");

    if (!apiKey) {
      console.error("[Email Error]: RESEND_API_KEY environment variable is not configured in Netlify settings.");
      return NextResponse.json({
        success: true,
        warning: "⚠️ Lead saved to DB, but email delivery failed. Please check RESEND_API_KEY in Netlify settings.",
        message: "Lead saved to DB, but email delivery failed. Please check RESEND_API_KEY in Netlify settings.",
      });
    }

    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.URL || "https://feedm.ee";
    const timestampStr = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    const subject = `🎉 New Lead Captured on FeedM.ee! (${fullName || "Visitor"})`;
    const senderEmail = process.env.RESEND_FROM_EMAIL || "FeedM.ee <updates@feedm.ee>";

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #111827;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #059669; margin: 0; font-size: 22px; font-weight: 800;">🎉 New Lead Captured on FeedM.ee!</h2>
          <p style="font-size: 13px; color: #6b7280; margin-top: 4px;">You just received a new contact submission from your video feed.</p>
        </div>

        <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 35%; font-weight: 600;">Full Name:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 700;">${fullName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Email Address:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: 700;">${email ? `<a href="mailto:${email}" style="color: #059669; text-decoration: none;">${email}</a>` : "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Phone Number:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 700;">${phone ? `<a href="tel:${phone}" style="color: #111827; text-decoration: none;">${phone}</a>` : "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Feed Handle:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 700;">@${feedId || "default"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Submission Time:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 600;">${timestampStr}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 24px 0 12px 0;">
          <a href="${BASE_URL}/dashboard" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 800; font-size: 13px; text-decoration: none; shadow: 0 2px 4px rgba(0,0,0,0.1);">
            View Leads in Dashboard &rarr;
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0 16px 0;" />
        <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">
          Sent via <a href="${BASE_URL}" style="color: #059669; text-decoration: none; font-weight: bold;">FeedM.ee</a> Video Link-in-Bio Platform
        </p>
      </div>
    `;

    let resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [targetEmail.trim()],
        subject: subject,
        html: htmlContent,
      }),
    });

    let resendData = await resendRes.json();

    // Automatic Fallback: If custom sender domain returns 403 or unverified domain error, retry with onboarding@resend.dev
    if (!resendRes.ok && (resendRes.status === 403 || resendData.message?.includes("domain") || resendData.message?.includes("Verify"))) {
      console.warn("[Resend Warning]: Primary sender domain failed. Retrying with onboarding@resend.dev...", resendData.message);
      const fallbackRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "FeedM.ee Leads <onboarding@resend.dev>",
          to: [targetEmail.trim()],
          subject: subject,
          html: htmlContent,
        }),
      });

      const fallbackData = await fallbackRes.json();
      if (fallbackRes.ok) {
        resendRes = fallbackRes;
        resendData = fallbackData;
        console.log("[Email Fallback Success]: Dispatched via onboarding@resend.dev", fallbackData);
      }
    }

    if (!resendRes.ok) {
      console.error("[Email Error]: Resend API Error response:", resendData);
      return NextResponse.json(
        {
          success: false,
          error: resendData.message || resendData.name || "Failed to deliver email via Resend API",
        },
        { status: resendRes.status || 500 }
      );
    }

    console.log("[Email Success]: Lead email dispatched successfully to", targetEmail, resendData);
    return NextResponse.json({
      success: true,
      message: `Lead captured & email sent to ${targetEmail}!`,
      id: resendData.id,
    });
  } catch (err: any) {
    console.error("[Email Error]: Internal Exception during lead email dispatch:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error during email dispatch" },
      { status: 500 }
    );
  }
}
