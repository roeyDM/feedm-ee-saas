export interface LeadWarningEmailParams {
  count: number;
  limit: number;
  ownerName?: string;
  feedHandle?: string;
  appUrl?: string;
}

export function renderLeadWarningEmail({
  count,
  limit,
  ownerName = "Creator",
  feedHandle = "@main",
  appUrl = "https://feedm.ee",
}: LeadWarningEmailParams): { subject: string; html: string } {
  const percentage = Math.min(100, Math.round((count / limit) * 100));
  const subject = `⚠️ You've reached 80% of your monthly lead limit on FeedM.ee`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: center;">
              <span style="font-size: 20px; font-weight: 900; color: #ffffff; tracking: -0.5px;">
                FeedM<span style="color: #10b981;">.ee</span>
              </span>
            </td>
          </tr>

          <!-- Warning Badge & Banner -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: center;">
              <div style="display: inline-block; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 9999px; padding: 6px 16px; margin-bottom: 16px;">
                <span style="font-size: 12px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">
                  ⚠️ Capacity Alert (80% Reached)
                </span>
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.3;">
                Your feed is generating high engagement!
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #4b5563; line-height: 1.5;">
                Hello ${ownerName}, you have captured <strong>${count} out of ${limit}</strong> monthly leads for ${feedHandle}.
              </p>
            </td>
          </tr>

          <!-- Progress Bar Box -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px;">
                  <span>Monthly Lead Usage</span>
                  <span style="color: #d97706;">${percentage}% (${count}/${limit})</span>
                </div>
                <!-- Progress track -->
                <div style="background-color: #e5e7eb; border-radius: 9999px; height: 10px; width: 100%; overflow: hidden;">
                  <div style="background-color: #f59e0b; height: 100%; width: ${percentage}%; border-radius: 9999px;"></div>
                </div>
                <p style="font-size: 12px; color: #6b7280; margin: 12px 0 0 0; font-weight: 500;">
                  Once you reach ${limit} leads, additional incoming visitor leads will be locked in your CRM until upgrade.
                </p>
              </div>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <a href="${appUrl}/pricing" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
                Upgrade Plan Now &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #f3f4f6; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Sent automatically by <a href="${appUrl}" style="color: #10b981; text-decoration: none; font-weight: 700;">FeedM.ee</a> Creator Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}
