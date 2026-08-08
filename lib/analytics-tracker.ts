/**
 * Client-Side Analytics Tracker Utility
 * Sends page_view, link_click, reel_play, and form_open events to /api/analytics/track
 */

export type AnalyticsEventType = "page_view" | "link_click" | "reel_play" | "form_open" | "lead_submit";

export async function trackAnalyticsEvent(
  username: string,
  eventType: AnalyticsEventType,
  extraData?: {
    linkUrl?: string;
    linkTitle?: string;
    reelId?: string;
    metadata?: Record<string, any>;
  }
) {
  if (!username) return;

  const cleanUsername = username.toLowerCase().trim();

  try {
    console.log(`[Analytics Client] Firing event "${eventType}" for @${cleanUsername}`, extraData || "");

    // Send payload asynchronously via fetch
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cleanUsername,
        event_type: eventType,
        link_url: extraData?.linkUrl,
        link_title: extraData?.linkTitle,
        reel_id: extraData?.reelId,
        metadata: extraData?.metadata || {},
      }),
    }).catch((err) => {
      console.warn("[Analytics Client Warning]: Track request failed silently:", err);
    });
  } catch (err) {
    console.warn("[Analytics Client Exception]:", err);
  }
}
