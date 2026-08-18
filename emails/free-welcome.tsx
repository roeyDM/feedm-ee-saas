import React from "react";

interface FreeWelcomeEmailProps {
  name?: string;
  loginUrl?: string;
  upgradeUrl?: string;
}

export function FreeWelcomeEmail({
  name = "Creator",
  loginUrl = "https://feedm.ee/dashboard",
  upgradeUrl = "https://feedm.ee/pricing",
}: FreeWelcomeEmailProps) {
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
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#09090b", margin: "0 0 16px" }}>
            Welcome to Feed Me, {name}! ⚡
          </h1>

          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4b5563", margin: "0 0 20px" }}>
            Your Single-Page Bio &amp; Links page is active! You can now customize your bio, connect custom social links, and start sharing your handle with your audience.
          </p>

          {/* What You're Missing Box */}
          <div style={{ backgroundColor: "#ecfdf5", borderRadius: "16px", padding: "20px", border: "1px solid #a7f3d0", margin: "0 0 28px" }}>
            <div style={{ fontSize: "13px", fontWeight: "800", color: "#065f46", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>
              ⚡ What You&apos;re Missing on Pro:
            </div>
            
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#047857", marginBottom: "8px" }}>
              • 3 Vertical Video Snap Reels (Pages 2–4)
            </div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#047857", marginBottom: "8px" }}>
              • Page 5 Built-in Lead Capture Form
            </div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#047857", marginBottom: "8px" }}>
              • Custom Domain &amp; 100% White-Label Branding
            </div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#047857" }}>
              • Real-time Traffic Attribution &amp; CTR Analytics
            </div>
          </div>

          {/* Primary CTA Button */}
          <div style={{ textAlign: "center", margin: "0 0 28px" }}>
            <a
              href={upgradeUrl}
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
              Upgrade Page to Pro 🚀
            </a>
          </div>

          <p style={{ fontSize: "12px", lineHeight: "1.5", color: "#6b7280", margin: "0", textAlign: "center" }}>
            Need help setting up? Reply directly to this email or visit our support desk at feedm.ee/pricing.
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

export function renderFreeWelcomeHtml(props: FreeWelcomeEmailProps): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Welcome to Feed Me — Your Bio & Links Page is Ready! ⚡</title></head>
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
              <h1 style="font-size:20px;font-weight:800;color:#09090b;margin:0 0 16px;">Welcome to Feed Me, ${props.name || "Creator"}! ⚡</h1>
              <p style="font-size:14px;line-height:1.6;color:#4b5563;margin:0 0 20px;">Your Single-Page Bio & Links page is active! You can now customize your bio, connect custom social links, and start sharing your handle with your audience.</p>
              
              <div style="background-color:#ecfdf5;border-radius:16px;padding:20px;border:1px solid #a7f3d0;margin:0 0 28px;">
                <div style="font-size:13px;font-weight:800;color:#065f46;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px;">⚡ What You're Missing on Pro:</div>
                <p style="font-size:13px;font-weight:600;color:#047857;margin:0 0 8px;">• 3 Vertical Video Snap Reels (Pages 2–4)</p>
                <p style="font-size:13px;font-weight:600;color:#047857;margin:0 0 8px;">• Page 5 Built-in Lead Capture Form</p>
                <p style="font-size:13px;font-weight:600;color:#047857;margin:0 0 8px;">• Custom Domain & 100% White-Label Branding</p>
                <p style="font-size:13px;font-weight:600;color:#047857;margin:0;">• Real-time Traffic Attribution & CTR Analytics</p>
              </div>

              <div style="text-align:center;margin:0 0 28px;">
                <a href="${props.upgradeUrl || "https://feedm.ee/pricing"}" style="display:inline-block;background-color:#00BC7D;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:9999px;text-decoration:none;">Upgrade Page to Pro 🚀</a>
              </div>
              <p style="font-size:12px;line-height:1.5;color:#6b7280;margin:0;text-align:center;">Need help setting up? Reply directly to this email or visit our support desk at feedm.ee/pricing.</p>
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
