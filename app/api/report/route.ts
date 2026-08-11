import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profileUrl = body.profileUrl || body.profile_url || body.url || "";
    
    let username = body.username || body.handle || "";
    if (!username && profileUrl) {
      const parts = profileUrl.split("/").filter(Boolean);
      username = parts[parts.length - 1] || "unknown";
    }
    if (username.startsWith("@")) {
      username = username.slice(1);
    }
    if (!username) {
      username = "unknown";
    }

    const reason = body.reason || "Unspecified Violation";
    const reporterEmail = body.reporterEmail || body.email || body.reporter_email || "Anonymous Visitor";
    const details = body.details || body.additionalDetails || "No additional context provided.";

    // 1. Log/Store report in Supabase DB with exact column schemas
    const feedId = body.feedId || body.feed_id || null;
    try {
      const dbAdmin = getSupabaseAdmin();

      const reportPayload = {
        feed_id: feedId,
        reported_username: username,
        username: username,
        profile_url: profileUrl || `https://feedm.ee/${username}`,
        reason: reason,
        reporter_email: reporterEmail,
        details: details,
        status: "pending",
      };

      const { error: insertError } = await dbAdmin.from("reports").insert([reportPayload]);

      if (insertError) {
        console.warn("⚠️ [Report DB Primary Insert Note]: Retrying fallback insert:", insertError.message);
        await dbAdmin.from("reports").insert([
          {
            reported_username: username,
            reason: reason,
            reporter_email: reporterEmail,
            details: details,
          },
        ]);
      } else {
        console.log("✅ [Report DB Insert Success]: Report recorded in Supabase reports table.");
      }
    } catch (dbErr) {
      console.warn("⚠️ [Report DB Warning]: Exception recording report to Supabase table:", dbErr);
    }

    // 2. Dispatch Notification Email via Resend API
    const apiKey =
      process.env.RESEND_API_KEY ||
      process.env.NEXT_PUBLIC_RESEND_API_KEY ||
      process.env.LEAD_EMAIL_API_KEY;

    const adminTargetEmail =
      process.env.SYSTEM_ADMIN_EMAIL ||
      process.env.SUPPORT_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "support@feedm.ee";

    const senderEmail = process.env.RESEND_FROM_EMAIL || "FeedM.ee Safety <updates@feedm.ee>";
    const subject = `[FeedM.ee Report] New Profile Report Submitted for @${username}`;
    const timestampStr = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 20px; background-color: #ffffff; color: #111827;">
        <div style="background-color: #0f172a; padding: 20px 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <span style="font-size: 18px; font-weight: 900; color: #ffffff;">
            FeedM<span style="color: #10b981;">.ee</span> Admin Safety Alert
          </span>
        </div>

        <div style="padding: 24px;">
          <div style="display: inline-block; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 9999px; padding: 4px 14px; margin-bottom: 14px;">
            <span style="font-size: 11px; font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">
              ⚠️ New Profile Violation Report
            </span>
          </div>

          <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
            Reported Handle: @${username}
          </h2>

          <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-top: 8px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; width: 35%;">Reported Profile:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 700;">
                <a href="${profileUrl || `https://feedm.ee/${username}`}" target="_blank" style="color: #10b981; text-decoration: none;">
                  ${profileUrl || `https://feedm.ee/${username}`}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600;">Violation Reason:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: 800;">${reason}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600;">Reporter Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 700;">${reporterEmail}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600;">Report Time:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 600;">${timestampStr}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px;">
            <span style="font-size: 11px; font-weight: 800; color: #4b5563; text-transform: uppercase; display: block; margin-bottom: 6px;">
              Additional Details &amp; Context:
            </span>
            <p style="margin: 0; font-size: 13px; color: #111827; line-height: 1.5; white-space: pre-wrap;">
              ${details}
            </p>
          </div>
        </div>

        <div style="background-color: #f9fafb; border-top: 1px solid #f3f4f6; padding: 16px 24px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="margin: 0; font-size: 11px; color: #9ca3af;">
            FeedM.ee Automated Safety &amp; Moderation Dispatch
          </p>
        </div>
      </div>
    `;

    if (apiKey) {
      try {
        let res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: senderEmail,
            to: [adminTargetEmail.trim()],
            subject: subject,
            html: htmlContent,
          }),
        });

        let data = await res.json();

        // Fallback to onboarding@resend.dev if custom sender domain fails verification
        if (!res.ok && (res.status === 403 || data.message?.includes("domain") || data.message?.includes("Verify"))) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey.trim()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "FeedM.ee Moderation <onboarding@resend.dev>",
              to: [adminTargetEmail.trim()],
              subject: subject,
              html: htmlContent,
            }),
          });
        }
      } catch (emailErr) {
        console.warn("[Report Resend Email Note]: Failed to dispatch Resend email:", emailErr);
      }
    } else {
      console.warn("[Report Resend Note]: RESEND_API_KEY is not configured.");
    }

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully.",
    });
  } catch (err: any) {
    console.error("[Report API Error]: Exception processing profile report:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error submitting report" },
      { status: 500 }
    );
  }
}
