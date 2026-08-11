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
            FeedM<span style={{ color: "#00BC7D" }}>.ee</span>
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
            Welcome to your Pro Trial, {name}
          </h1>

          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4b5563", margin: "0 0 20px" }}>
            Your 7-day trial of <strong>{planName}</strong> is now active. You have full unlocked access to our premium video snap reel features until <strong>{trialEndsAt}</strong>.
          </p>

          {/* Unlocked Features Summary */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", margin: "0 0 28px" }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#09090b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>
              Unlocked Pro Features
            </div>
            
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", margin: "0 0 8px" }}>
              • 3 Full-Screen Vertical Video Reels (TikTok/Instagram snap style)
            </p>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", margin: "0 0 8px" }}>
              • Direct WhatsApp &amp; 1-Tap Phone Call Lead Form Integration
            </p>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", margin: "0 0 8px" }}>
              • Custom Subdomain &amp; Clean Branding Options
            </p>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", margin: "0" }}>
              • Real-time CRM Analytics &amp; Lead Export
            </p>
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
              Explore Pro Features
            </a>
          </div>

          <p style={{ fontSize: "12px", lineHeight: "1.5", color: "#6b7280", margin: "0", textAlign: "center" }}>
            You will not be charged during your 7-day trial. You can manage or modify your subscription anytime from your FeedM dashboard settings.
          </p>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: "#f9fafb", padding: "20px 32px", borderTop: "1px solid #f3f4f6", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "500" }}>
            &copy; {new Date().getFullYear()} FeedM.ee SaaS. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export function renderTrialStartedHtml(props: TrialStartedEmailProps): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Welcome to Your Pro Trial</title></head>
<body style="margin:0;padding:0;background-color:#f9fafb;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f9fafb;padding:40px 20px;font-family:Inter,Helvetica,Arial,sans-serif;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:24px;border:1px solid #e5e7eb;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #f3f4f6;">
              <div style="font-size:22px;font-weight:900;color:#09090b;letter-spacing:-0.5px;">FeedM<span style="color:#00BC7D;">.ee</span></div>
              <div style="font-size:12px;font-weight:600;color:#6b7280;margin-top:4px;">The 5-Page Vertical Snap Bio Platform</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <div style="display:inline-block;background-color:#ecfdf5;color:#047857;font-size:11px;font-weight:800;padding:6px 14px;border-radius:9999px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;">7-Day Pro Trial Active</div>
              <h1 style="font-size:20px;font-weight:800;color:#09090b;margin:0 0 16px;">Welcome to your Pro Trial, ${props.name || "Creator"}</h1>
              <p style="font-size:14px;line-height:1.6;color:#4b5563;margin:0 0 20px;">Your 7-day trial of <strong>${props.planName || "Pro Plan"}</strong> is now active. You have full unlocked access to our premium video snap reel features until <strong>${props.trialEndsAt || "7 days from today"}</strong>.</p>
              <div style="background-color:#f8fafc;border-radius:16px;padding:20px;border:1px solid #e2e8f0;margin:0 0 28px;">
                <div style="font-size:12px;font-weight:800;color:#09090b;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px;">Unlocked Pro Features</div>
                <p style="font-size:13px;font-weight:600;color:#1e293b;margin:0 0 8px;">• 3 Full-Screen Vertical Video Reels (TikTok/Instagram snap style)</p>
                <p style="font-size:13px;font-weight:600;color:#1e293b;margin:0 0 8px;">• Direct WhatsApp &amp; 1-Tap Phone Call Lead Form Integration</p>
                <p style="font-size:13px;font-weight:600;color:#1e293b;margin:0 0 8px;">• Custom Subdomain &amp; Clean Branding Options</p>
                <p style="font-size:13px;font-weight:600;color:#1e293b;margin:0;">• Real-time CRM Analytics &amp; Lead Export</p>
              </div>
              <div style="text-align:center;margin:0 0 28px;">
                <a href="${props.dashboardUrl || "https://feedm.ee/dashboard"}" style="display:inline-block;background-color:#00BC7D;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:9999px;text-decoration:none;">Explore Pro Features</a>
              </div>
              <p style="font-size:12px;line-height:1.5;color:#6b7280;margin:0;text-align:center;">You will not be charged during your 7-day trial. You can manage or modify your subscription anytime from your FeedM dashboard settings.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
              <div style="font-size:11px;color:#9ca3af;font-weight:500;">&copy; ${new Date().getFullYear()} FeedM.ee SaaS. All rights reserved.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
