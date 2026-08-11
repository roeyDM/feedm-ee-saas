import React from "react";

interface FreeWelcomeEmailProps {
  name?: string;
  loginUrl?: string;
}

export function FreeWelcomeEmail({
  name = "Creator",
  loginUrl = "https://feedm.ee/dashboard",
}: FreeWelcomeEmailProps) {
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
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#09090b", margin: "0 0 16px" }}>
            Welcome to FeedM, {name}
          </h1>

          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4b5563", margin: "0 0 20px" }}>
            Your Starter Free account is active. You can now build your 5-page snap bio feed, connect custom bio links, and start sharing your link with your audience.
          </p>

          {/* Quick Setup Checklist */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", margin: "0 0 28px" }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#09090b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>
              Quick Setup Checklist
            </div>
            
            <div style={{ display: "flex", alignItems: "flex-start", margin: "0 0 10px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
                1. Set up your avatar, bio text, and custom brand theme color.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", margin: "0 0 10px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
                2. Add your primary social links and custom call-to-action buttons.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
                3. Share your unique feedm.ee/yourhandle link in your Instagram &amp; TikTok bio.
              </div>
            </div>
          </div>

          {/* Primary CTA Button */}
          <div style={{ textAlign: "center", margin: "0 0 28px" }}>
            <a
              href={loginUrl}
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
              Build Your Free Page
            </a>
          </div>

          <p style={{ fontSize: "12px", lineHeight: "1.5", color: "#6b7280", margin: "0", textAlign: "center" }}>
            Need help setting up? Reply directly to this email or visit our support desk at feedm.ee/pricing.
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

export function renderFreeWelcomeHtml(props: FreeWelcomeEmailProps): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Welcome to FeedM</title></head>
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
              <h1 style="font-size:20px;font-weight:800;color:#09090b;margin:0 0 16px;">Welcome to FeedM, ${props.name || "Creator"}</h1>
              <p style="font-size:14px;line-height:1.6;color:#4b5563;margin:0 0 20px;">Your Starter Free account is active. You can now build your 5-page snap bio feed, connect custom bio links, and start sharing your link with your audience.</p>
              <div style="background-color:#f8fafc;border-radius:16px;padding:20px;border:1px solid #e2e8f0;margin:0 0 28px;">
                <div style="font-size:12px;font-weight:800;color:#09090b;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px;">Quick Setup Checklist</div>
                <p style="font-size:13px;font-weight:600;color:#1e293b;margin:0 0 8px;">1. Set up your avatar, bio text, and custom brand theme color.</p>
                <p style="font-size:13px;font-weight:600;color:#1e293b;margin:0 0 8px;">2. Add your primary social links and custom call-to-action buttons.</p>
                <p style="font-size:13px;font-weight:600;color:#1e293b;margin:0;">3. Share your unique feedm.ee/yourhandle link in your Instagram &amp; TikTok bio.</p>
              </div>
              <div style="text-align:center;margin:0 0 28px;">
                <a href="${props.loginUrl || "https://feedm.ee/dashboard"}" style="display:inline-block;background-color:#00BC7D;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:9999px;text-decoration:none;">Build Your Free Page</a>
              </div>
              <p style="font-size:12px;line-height:1.5;color:#6b7280;margin:0;text-align:center;">Need help setting up? Reply directly to this email or visit our support desk at feedm.ee/pricing.</p>
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
