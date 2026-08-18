import React from "react";

interface SubscriptionActiveEmailProps {
  name?: string;
  planName?: string;
  receiptUrl?: string;
  dashboardUrl?: string;
}

export function SubscriptionActiveEmail({
  name = "Creator",
  planName = "Pro Plan",
  receiptUrl,
  dashboardUrl = "https://feedm.ee/dashboard",
}: SubscriptionActiveEmailProps) {
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
            Subscription Active
          </div>

          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#09090b", margin: "0 0 16px" }}>
            Payment Confirmed — Welcome to Feed Me {planName}! 🎉
          </h1>

          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4b5563", margin: "0 0 20px" }}>
            Thank you for subscribing, {name}! Your <strong>{planName}</strong> subscription is active. All Pro features, vertical video reels, lead forms, and analytics remain fully unlocked.
          </p>

          {receiptUrl && (
            <div style={{ margin: "0 0 24px" }}>
              <a
                href={receiptUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "13px", fontWeight: "700", color: "#00BC7D", textDecoration: "underline" }}
              >
                View / Download Your Official Receipt &rarr;
              </a>
            </div>
          )}

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
              Access Creator Studio 🚀
            </a>
          </div>
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

export function renderSubscriptionActiveHtml(props: SubscriptionActiveEmailProps): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Payment Confirmed — Welcome to Feed Me ${props.planName || "Pro Plan"}</title></head>
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
              <div style="display:inline-block;background-color:#ecfdf5;color:#047857;font-size:11px;font-weight:800;padding:6px 14px;border-radius:9999px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;">Subscription Active</div>
              <h1 style="font-size:20px;font-weight:800;color:#09090b;margin:0 0 16px;">Payment Confirmed — Welcome to Feed Me ${props.planName || "Pro Plan"}! 🎉</h1>
              <p style="font-size:14px;line-height:1.6;color:#4b5563;margin:0 0 20px;">Thank you for subscribing, ${props.name || "Creator"}! Your <strong>${props.planName || "Pro Plan"}</strong> subscription is active. All Pro features, vertical video reels, lead forms, and analytics remain fully unlocked.</p>
              
              <div style="text-align:center;margin:0 0 28px;">
                <a href="${props.dashboardUrl || "https://feedm.ee/dashboard"}" style="display:inline-block;background-color:#00BC7D;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:9999px;text-decoration:none;">Access Creator Studio 🚀</a>
              </div>
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
