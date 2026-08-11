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
  receiptUrl = "",
  dashboardUrl = "https://feedm.ee/dashboard",
}: SubscriptionActiveEmailProps) {
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
            Subscription Active
          </div>

          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#09090b", margin: "0 0 16px" }}>
            Payment Confirmed — Welcome to {planName}, {name}!
          </h1>

          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4b5563", margin: "0 0 20px" }}>
            Thank you for subscribing to <strong>{planName}</strong>. Your payment has been processed successfully, and your account has full unlimited access to all premium video snap features.
          </p>

          {/* Subscription Receipt Box */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", margin: "0 0 28px" }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#09090b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>
              Subscription Details
            </div>
            
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", margin: "0 0 8px" }}>
              • Plan: <strong>{planName}</strong>
            </p>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", margin: "0 0 8px" }}>
              • Status: <strong style={{ color: "#00BC7D" }}>Active</strong>
            </p>
            {receiptUrl ? (
              <p style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", margin: "0" }}>
                • Receipt: <a href={receiptUrl} style={{ color: "#00BC7D", textDecoration: "underline" }}>View Invoice &amp; Receipt</a>
              </p>
            ) : null}
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
              Go to Dashboard
            </a>
          </div>

          <p style={{ fontSize: "12px", lineHeight: "1.5", color: "#6b7280", margin: "0", textAlign: "center" }}>
            You can manage your subscription, download invoices, or update payment methods anytime from your Creator Studio settings.
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

export function renderSubscriptionActiveHtml(props: SubscriptionActiveEmailProps): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Subscription Active</title></head>
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
              <div style="display:inline-block;background-color:#ecfdf5;color:#047857;font-size:11px;font-weight:800;padding:6px 14px;border-radius:9999px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;">Subscription Active</div>
              <h1 style="font-size:20px;font-weight:800;color:#09090b;margin:0 0 16px;">Payment Confirmed — Welcome to ${props.planName || "Pro Plan"}, ${props.name || "Creator"}!</h1>
              <p style="font-size:14px;line-height:1.6;color:#4b5563;margin:0 0 20px;">Thank you for subscribing to <strong>${props.planName || "Pro Plan"}</strong>. Your payment has been processed successfully, and your account has full unlimited access to all premium video snap features.</p>
              <div style="background-color:#f8fafc;border-radius:16px;padding:20px;border:1px solid #e2e8f0;margin:0 0 28px;">
                <div style="font-size:12px;font-weight:800;color:#09090b;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px;">Subscription Details</div>
                <p style="font-size:13px;font-weight:600;color:#1e293b;margin:0 0 8px;">• Plan: <strong>${props.planName || "Pro Plan"}</strong></p>
                <p style="font-size:13px;font-weight:600;color:#1e293b;margin:0 0 8px;">• Status: <strong style="color:#00BC7D;">Active</strong></p>
                ${props.receiptUrl ? `<p style="font-size:13px;font-weight:600;color:#1e293b;margin:0;">• Receipt: <a href="${props.receiptUrl}" style="color:#00BC7D;text-decoration:underline;">View Invoice &amp; Receipt</a></p>` : ""}
              </div>
              <div style="text-align:center;margin:0 0 28px;">
                <a href="${props.dashboardUrl || "https://feedm.ee/dashboard"}" style="display:inline-block;background-color:#00BC7D;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:9999px;text-decoration:none;">Go to Dashboard</a>
              </div>
              <p style="font-size:12px;line-height:1.5;color:#6b7280;margin:0;text-align:center;">You can manage your subscription, download invoices, or update payment methods anytime from your Creator Studio settings.</p>
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
