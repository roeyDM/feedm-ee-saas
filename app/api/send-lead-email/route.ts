import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { renderLeadWarningEmail } from "@/lib/email/templates/lead-warning-email";
import { renderLeadLimitReachedEmail } from "@/lib/email/templates/lead-limit-reached-email";

const isUUID = (str: any): boolean =>
  typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    console.log("[Lead API Body Received]:", body);
    console.log("[Lead Submitted]:", body);

    const targetEmail = body.targetEmail || body.target_email || "";
    const fullName = body.fullName || body.name || "";
    const email = body.email || "";
    const phone = body.phone || "";

    const rawFeedHandle = body.feedHandle || body.feed_handle || body.username || body.feedId || body.feedName || "";
    let cleanHandle = typeof rawFeedHandle === "string" ? rawFeedHandle.trim() : "";
    if (cleanHandle.startsWith("@")) {
      cleanHandle = cleanHandle.slice(1);
    }
    const formattedFeedHandle = cleanHandle ? `@${cleanHandle}` : "@main";

    const isTestMode =
      body.is_preview === true ||
      body.source === "simulator";

    console.log("[Lead Ingestion]: Processing lead", { isPreview: isTestMode, email: email || targetEmail });

    if (isTestMode) {
      console.log("🧪 [Simulator Test Lead]: Bypassing DB quotas, CRM lead lists, and Resend emails.");
      return NextResponse.json({
        success: true,
        preview: true,
        isTestMode: true,
        message: "Simulator submission succeeded without affecting quotas or sending emails.",
      });
    }

    const dbAdmin = getSupabaseAdmin();
    let feedOwnerUserId: string | null = null;
    let ownerProfile: any = null;

    // 1. Resolve Feed Owner's user_id from feeds OR profiles table
    try {
      const feedIdParam = body.feedId || body.feed_id || cleanHandle;
      if (feedIdParam) {
        let query = dbAdmin.from("feeds").select("user_id, handle, id");
        if (isUUID(feedIdParam)) {
          query = query.or(`id.eq.${feedIdParam},user_id.eq.${feedIdParam}`);
        } else {
          query = query.eq("handle", feedIdParam.toLowerCase());
        }

        const { data: feed } = await query.maybeSingle();
        if (feed?.user_id) {
          feedOwnerUserId = feed.user_id;
        }
      }

      if (!feedOwnerUserId && cleanHandle) {
        let profQuery = dbAdmin
          .from("profiles")
          .select("id, username, email, full_name, plan_type, warning_email_sent_month, limit_email_sent_month");

        if (isUUID(cleanHandle)) {
          profQuery = profQuery.eq("id", cleanHandle);
        } else {
          profQuery = profQuery.ilike("username", cleanHandle.toLowerCase());
        }

        const { data: profile } = await profQuery.maybeSingle();
        if (profile?.id) {
          feedOwnerUserId = profile.id;
          ownerProfile = profile;
        }
      }

      if (feedOwnerUserId && !ownerProfile) {
        const { data: prof } = await dbAdmin
          .from("profiles")
          .select("id, username, email, full_name, plan_type, warning_email_sent_month, limit_email_sent_month")
          .eq("id", feedOwnerUserId)
          .maybeSingle();
        ownerProfile = prof;
      }
    } catch (resolveErr) {
      console.warn("[Lead Resolver Note]: Could not resolve user_id for handle/feed:", cleanHandle, resolveErr);
    }

    // Resolve strictly valid 36-character UUID for feed_id column
    let feedIdUUID: string | null = null;
    if (isUUID(body.feed_id)) feedIdUUID = String(body.feed_id).trim();
    else if (isUUID(body.feedId)) feedIdUUID = String(body.feedId).trim();
    else if (isUUID(feedOwnerUserId)) feedIdUUID = feedOwnerUserId;
    else if (isUUID(ownerProfile?.id)) feedIdUUID = ownerProfile.id;

    // 2. Calculate Monthly Lead Count & Enforce Plan Thresholds
    const ownerPlan = (ownerProfile?.plan_type || "free").toLowerCase();
    let limit = 5;
    let warningThreshold = 4;
    let isUnlimited = false;

    if (ownerPlan === "personal") {
      limit = 20;
      warningThreshold = 18;
    } else if (ownerPlan === "pro" || ownerPlan === "business") {
      limit = 999999;
      warningThreshold = 999999;
      isUnlimited = true;
    }

    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const currentMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    let currentMonthlyLeadCount = 0;
    if (feedOwnerUserId) {
      const { count } = await dbAdmin
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("user_id", feedOwnerUserId)
        .gte("created_at", startOfMonth);
      currentMonthlyLeadCount = count || 0;
    }

    const newTotalLeadCount = currentMonthlyLeadCount + 1;
    const isLocked = !isUnlimited && newTotalLeadCount > limit;
    const assignedStatus = isLocked ? "locked" : "active";

    // 3. Perform Database Insertion BEFORE Email Dispatch
    try {
      const leadPayload: any = {
        user_id: isUUID(feedOwnerUserId) ? feedOwnerUserId : null,
        feed_id: feedIdUUID,
        feed_handle: formattedFeedHandle || "@default",
        full_name: fullName || body.name || "Visitor",
        email: email || targetEmail || "",
        phone: phone || "",
        target_email: targetEmail || ownerProfile?.email || "",
        status: assignedStatus,
        created_at: new Date().toISOString(),
      };

      console.log("📝 [Lead Ingestion] Executing Supabase leads insert:", leadPayload);

      const { data: insertedData, error: dbError } = await dbAdmin
        .from("leads")
        .insert([leadPayload])
        .select();

      if (dbError) {
        console.error("[Lead DB Insert Failed]: Supabase leads insert error:", dbError.message, dbError.details);
      } else {
        console.log("✅ [Lead DB Insert Success]: Lead row created in Supabase leads table:", insertedData);
      }
    } catch (dbErr) {
      console.error("[Lead DB Insert Failed]: Exception during lead insert:", dbErr);
    }

    // 4. Record form_submit event in feed_analytics
    try {
      const targetAnalyticsFeedId = feedIdUUID || (isUUID(feedOwnerUserId) ? feedOwnerUserId : null);
      if (targetAnalyticsFeedId) {
        await dbAdmin.from("feed_analytics").insert([
          {
            feed_id: targetAnalyticsFeedId,
            event_type: "form_submit",
            item_id: "lead_form",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (analyticsErr) {
      console.warn("[Lead Analytics Ingest Note]:", analyticsErr);
    }

    // 5. Dispatch Resend Email Notification
    const apiKey =
      process.env.RESEND_API_KEY ||
      process.env.NEXT_PUBLIC_RESEND_API_KEY ||
      process.env.LEAD_EMAIL_API_KEY;

    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.URL || "https://feedm.ee";
    const senderEmail = process.env.RESEND_FROM_EMAIL || "FeedM.ee <updates@feedm.ee>";
    const recipientEmail = targetEmail || ownerProfile?.email || "";

    const sendResendMail = async (toEmail: string, emailSubject: string, htmlBody: string) => {
      if (!apiKey) {
        console.warn("[Resend Warning]: Missing RESEND_API_KEY. Email notification skipped.");
        return;
      }
      if (!toEmail || !toEmail.includes("@")) {
        console.warn("[Resend Warning]: Missing recipient email. Notification skipped.");
        return;
      }

      try {
        let res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: senderEmail,
            to: [toEmail.trim()],
            subject: emailSubject,
            html: htmlBody,
          }),
        });

        let data = await res.json();

        if (!res.ok && (res.status === 403 || data.message?.includes("domain") || data.message?.includes("Verify"))) {
          res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey.trim()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "FeedM.ee Alerts <onboarding@resend.dev>",
              to: [toEmail.trim()],
              subject: emailSubject,
              html: htmlBody,
            }),
          });
        }
        console.log(`✉️ [Resend Success]: Notification email sent to ${toEmail}`);
      } catch (e) {
        console.error("[Lead Processing Error]: Resend dispatch exception:", e);
      }
    };

    // 6. Threshold & Capacity Email Triggers
    if (!isUnlimited && feedOwnerUserId && recipientEmail) {
      if (
        newTotalLeadCount >= warningThreshold &&
        newTotalLeadCount <= limit &&
        ownerProfile?.warning_email_sent_month !== currentMonthKey
      ) {
        const warningTemplate = renderLeadWarningEmail({
          count: newTotalLeadCount,
          limit,
          ownerName: ownerProfile?.full_name || "Creator",
          feedHandle: formattedFeedHandle,
          appUrl: BASE_URL,
        });

        await sendResendMail(recipientEmail, warningTemplate.subject, warningTemplate.html);

        await dbAdmin
          .from("profiles")
          .update({ warning_email_sent_month: currentMonthKey })
          .eq("id", feedOwnerUserId);
      }

      if (
        newTotalLeadCount >= limit &&
        ownerProfile?.limit_email_sent_month !== currentMonthKey
      ) {
        const limitTemplate = renderLeadLimitReachedEmail({
          count: newTotalLeadCount,
          limit,
          ownerName: ownerProfile?.full_name || "Creator",
          feedHandle: formattedFeedHandle,
          appUrl: BASE_URL,
        });

        await sendResendMail(recipientEmail, limitTemplate.subject, limitTemplate.html);

        await dbAdmin
          .from("profiles")
          .update({ limit_email_sent_month: currentMonthKey })
          .eq("id", feedOwnerUserId);
      }
    }

    // 7. Standard Lead Notification Email
    if (!isLocked && recipientEmail) {
      const timestampStr = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
      const standardSubject = `🎉 New Lead Captured on FeedM.ee! (${fullName || "Visitor"})`;

      const standardHtml = `
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
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 700;">${formattedFeedHandle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Submission Time:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${timestampStr}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 24px 0 12px 0;">
            <a href="${BASE_URL}/dashboard" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 800; font-size: 13px; text-decoration: none;">
              View Leads in Dashboard &rarr;
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0 16px 0;" />
          <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">
            Sent via <a href="${BASE_URL}" style="color: #059669; text-decoration: none; font-weight: bold;">FeedM.ee</a> Video Link-in-Bio Platform
          </p>
        </div>
      `;

      await sendResendMail(recipientEmail, standardSubject, standardHtml);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your submission has been received.",
      status: assignedStatus,
    });
  } catch (err: any) {
    console.error("[Lead Processing Error]: Exception during lead submission:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error during lead submission" },
      { status: 500 }
    );
  }
}
