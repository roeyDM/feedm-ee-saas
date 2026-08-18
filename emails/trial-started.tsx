import React from "react";

interface TrialStartedEmailProps {
  name?: string;
  planName?: string;
  trialEndsAt?: string;
  dashboardUrl?: string;
}

export function TrialStartedEmail({
  name = "Creator",
  planName = "Pro Plan",
  trialEndsAt = "7 days from today",
  dashboardUrl = "https://feedm.ee/dashboard",
}: TrialStartedEmailProps) {
  return (
    <div style={{ fontFamily: "Inter, Helvetica, Arial, sans-serif", backgroundColor: "#f9fafb", padding: "40px 20px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "24px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}>
        {/* Brand Header */}
        <div style={{ padding: "32px 32px 24px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#09090b", letterSpacing: "-0.5px" }}>
            Feed <span style={{ color: "#00BC7D" }}>Me</span>
          </div>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", marginTop: "4px" }}>
            The 5-Page Vertical Snap Bio Platform
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: "32px" }}>
          <div style={{ display: "inline-block", backgroundColor: "#ecfdf5", color: "#047857", fontSize: "11px", fontWeight: "800", padding: "6px 14px", borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 16px" }}>
            7-Day Pro Trial Active
          </div>

          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#09090b", margin: "0 0 16px" }}>
            Welcome to Feed Me — Your 5-Page Bio &amp; 7-Day Pro Trial are Live! 🚀
          </h1>

          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4b5563", margin: "0 0 20px" }}>
            Hey {name}, your 7-day free trial of <strong>{planName}</strong> is now live! You have full access to 3 Video Snap Reels, Page 5 Lead Capture Form, Custom Domain integration, and Advanced Analytics.
          </p>

          {/* Trial Details Card */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", margin: "0 0 28px" }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#09090b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>
              Trial Subscription Summary
            </div>
            
            <div style={{ fontSize: "13px", color: "#4b5563", marginBottom: "8px" }}>
              <strong>Plan:</strong> {planName} (7-Day Trial)
            </div>
            <div style={{ fontSize: "13px", color: "#4b5563", marginBottom: "8px" }}>
              <strong>Trial Expiration:</strong> {trialEndsAt}
            </div>
            <div style={{ fontSize: "13px", color: "#047857", fontWeight: "700" }}>
              <strong>Status:</strong> Active — Full Access Unlocked
            </div>
          </div>

          {/* Primary CTA Button */}
          <div style={{ textAlign: "center", margin: "0 0 28px" }}>
            <a
              href={dashboardUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#00BC7D",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "700",
                padding: "14px 32px",
                borderRadius: "9999px",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(0, 188, 125, 0.3)",
              }}
            >
              Go to Your Creator Dashboard 🚀
            </a>
          </div>

          <p style={{ fontSize: "12px", lineHeight: "1.5", color: "#6b7280", margin: "0", textAlign: "center" }}>
            You will not be charged during your 7-day trial. You can manage or modify your subscription anytime from your Feed Me dashboard settings.
          </p>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: "#f9fafb", padding: "20px 32px", borderTop: "1px solid #f3f4f6", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "500" }}>
            &copy; {new Date().getFullYear()} Feed Me. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export function renderTrialStartedHtml(props: TrialStartedEmailProps): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Welcome to Feed Me — Your 5-Page Bio & 7-Day Pro Trial are Live! 🚀</title></head>
<body style="margin:0;padding:0;background-color:#f9fafb;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f9fafb;padding:40px 20px;font-family:Inter,Helvetica,Arial,sans-serif;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:24px;border:1px solid #e5e7eb;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #f3f4f6;">
              <div style="font-size:22px;font-weight:900;color:#09090b;letter-spacing:-0.5px;">Feed <span style="color:#00BC7D;">Me</span></div>
              <div style="font-size:12px;font-weight:600;color:#6b7280;margin-top:4px;">The 5-Page Vertical Snap Bio Platform</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <div style="display:inline-block;background-color:#ecfdf5;color:#047857;font-size:11px;font-weight:800;padding:6px 14px;border-radius:9999px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;">7-Day Pro Trial Active</div>
              <h1 style="font-size:20px;font-weight:800;color:#09090b;margin:0 0 16px;">Welcome to Feed Me — Your 5-Page Bio & 7-Day Pro Trial are Live! 🚀</h1>
              <p style="font-size:14px;line-height:1.6;color:#4b5563;margin:0 0 20px;">Hey ${props.name || "Creator"}, your 7-day free trial of <strong>${props.planName || "Pro Plan"}</strong> is now live! You have full access to 3 Video Snap Reels, Page 5 Lead Capture Form, Custom Domain integration, and Advanced Analytics.</p>
              
              <div style="background-color:#f8fafc;border-radius:16px;padding:20px;border:1px solid #e2e8f0;margin:0 0 28px;">
                <div style="font-size:12px;font-weight:800;color:#09090b;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px;">Trial Subscription Summary</div>
                <p style="font-size:13px;color:#4b5563;margin:0 0 8px;"><strong>Plan:</strong> ${props.planName || "Pro Plan"} (7-Day Trial)</p>
                <p style="font-size:13px;color:#4b5563;margin:0 0 8px;"><strong>Trial Expiration:</strong> ${props.trialEndsAt || "7 days from today"}</p>
                <p style="font-size:13px;color:#047857;font-weight:700;margin:0;"><strong>Status:</strong> Active — Full Access Unlocked</p>
              </div>

              <div style="text-align:center;margin:0 0 28px;">
                <a href="${props.dashboardUrl || "https://feedm.ee/dashboard"}" style="display:inline-block;background-color:#00BC7D;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:9999px;text-decoration:none;">Go to Your Creator Dashboard 🚀</a>
              </div>
              <p style="font-size:12px;line-height:1.5;color:#6b7280;margin:0;text-align:center;">You will not be charged during your 7-day trial. You can manage or modify your subscription anytime from your Feed Me dashboard settings.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
              <div style="font-size:11px;color:#9ca3af;font-weight:500;">&copy; ${new Date().getFullYear()} Feed Me. All rights reserved.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
