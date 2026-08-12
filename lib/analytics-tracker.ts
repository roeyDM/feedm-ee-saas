/**
 * Client-Side Analytics Tracker Utility
 * Sends view, click, page_view, and link_click events to /api/analytics/track
 */

export type AnalyticsEventType = "page_view" | "link_click" | "reel_play" | "form_open" | "lead_submit" | "view" | "click";

export async function trackAnalyticsEvent(
  username: string,
  eventType: AnalyticsEventType,
  extraData?: {
    feedId?: string;
    itemId?: string;
    linkUrl?: string;
    linkTitle?: string;
    reelId?: string;
    metadata?: Record<string, any>;
  }
) {
  if (!username && !extraData?.feedId) return;

  const cleanUsername = username ? username.toLowerCase().trim() : "";
  const normType = eventType === "page_view" ? "view" : eventType === "link_click" ? "click" : eventType;

  try {
    console.log(`[Analytics Client] Firing event "${normType}" for feed_id: ${extraData?.feedId || "N/A"} @${cleanUsername}`, extraData || "");

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feed_id: extraData?.feedId,
        username: cleanUsername,
        event_type: normType,
        item_id: extraData?.itemId || extraData?.linkUrl || extraData?.linkTitle || null,
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
