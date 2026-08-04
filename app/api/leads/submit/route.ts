import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetEmail, name, email, phone, isTest } = body;

    if (!targetEmail || typeof targetEmail !== "string" || !targetEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Invalid target recipient email address" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY || process.env.LEAD_EMAIL_API_KEY;

    if (!apiKey) {
      console.warn("[Email Error]: RESEND_API_KEY environment variable is not set on the server.");
      return NextResponse.json(
        {
          success: false,
          error: "RESEND_API_KEY environment variable is not configured on server",
        },
        { status: 500 }
      );
    }

    const subject = isTest
      ? `[Test Lead] New Submission from FeedM.ee Simulator`
      : `[New Lead] ${name || "New Lead"} submitted details via FeedM.ee`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FeedM.ee Leads <onboarding@resend.dev>",
        to: [targetEmail.trim()],
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #059669; margin-top: 0; font-size: 18px;">🎉 New Lead Received via FeedM.ee</h2>
            <p style="font-size: 13px; color: #374151;">Here are the contact details submitted from your lead capture form:</p>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin: 15px 0;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; width: 35%;">Full Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: bold;">${name || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Email Address:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: bold;">${email || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Phone Number:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: bold;">${phone || "N/A"}</td>
              </tr>
            </table>
            <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 20px;">
              Powered by <a href="https://feedm.ee" style="color: #059669; text-decoration: none; font-weight: bold;">FeedM.ee</a> Video Link-in-Bio
            </p>
          </div>
        `,
      }),
    });

    const resendData = await resendRes.json();

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
