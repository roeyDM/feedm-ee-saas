export interface LeadLimitReachedEmailParams {
  count: number;
  limit: number;
  ownerName?: string;
  feedHandle?: string;
  appUrl?: string;
}

export function renderLeadLimitReachedEmail({
  count,
  limit,
  ownerName = "Creator",
  feedHandle = "@main",
  appUrl = "https://feedm.ee",
}: LeadLimitReachedEmailParams): { subject: string; html: string } {
  const subject = `🔒 Monthly lead limit reached – New leads are currently locked`;

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

          <!-- Lock Badge & Banner -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: center;">
              <div style="display: inline-block; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 9999px; padding: 6px 16px; margin-bottom: 16px;">
                <span style="font-size: 12px; font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">
                  🔒 Monthly Lead Limit Reached
                </span>
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.3;">
                New incoming leads are locked!
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #4b5563; line-height: 1.5;">
                Hello ${ownerName}, your feed <strong>${feedHandle}</strong> has reached its maximum monthly capacity of <strong>${limit} leads</strong>.
              </p>
            </td>
          </tr>

          <!-- Locked Lead Mock Container -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background-color: #fff1f2; border: 1px dashed #f43f5e; border-radius: 16px; padding: 20px; text-align: center;">
                <div style="font-size: 13px; font-weight: 800; color: #be123c; margin-bottom: 8px;">
                  🔒 Locked Incoming Customer Lead
                </div>
                <div style="background-color: #ffffff; border: 1px solid #ffe4e6; border-radius: 12px; padding: 14px; margin-top: 10px;">
                  <p style="margin: 0; font-size: 13px; font-weight: 700; color: #881337; filter: blur(3px); user-select: none;">
                    Alexander Vance • alex.vance@example.com • +1 555-0199
                  </p>
                  <p style="margin: 6px 0 0 0; font-size: 11px; font-weight: 800; color: #e11d48; text-transform: uppercase;">
                    [ Upgrade to Growth Pro to Unlock Full Contact Details ]
                  </p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Explanatory Copy -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6; text-align: center;">
                Your monthly lead limit of <strong>${limit}</strong> has been reached. New incoming leads are safely stored in your database but currently locked. Upgrade now to instantly unlock all pending leads and manage them in your CRM.
              </p>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <a href="${appUrl}/pricing" target="_blank" style="display: inline-block; background-color: #e11d48; color: #ffffff; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);">
                Unlock My Leads &amp; Upgrade Now &rarr;
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
