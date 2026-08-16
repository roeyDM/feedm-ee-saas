/**
 * Client-Side Analytics Tracker Utility
 * Sends page_view, click, social_click, call_click, whatsapp_click, video_view, video_like, share, form_opened, form_submit events to /api/analytics/track
 */

export type AnalyticsEventType =
  | "view"
  | "click"
  | "page_view"
  | "link_click"
  | "social_click"
  | "call_click"
  | "whatsapp_click"
  | "video_view"
  | "video_like"
  | "share"
  | "form_opened"
  | "form_open"
  | "form_submit"
  | "reel_play"
  | "lead_submit";

export async function trackAnalyticsEvent(
  username: string,
  eventType: AnalyticsEventType,
  extraData?: {
    feedId?: string;
    itemId?: string;
    linkUrl?: string;
    linkTitle?: string;
    reelId?: string;
    isPreview?: boolean;
    source?: string;
    metadata?: Record<string, any>;
  }
) {
  if (!username && !extraData?.feedId) return;

  const cleanUsername = username ? username.toLowerCase().trim() : "";
  // Standardize event types: 'view' -> 'page_view'
  const normType = eventType === "view" ? "page_view" : eventType;
  const itemId = extraData?.itemId || extraData?.linkUrl || extraData?.linkTitle || null;

  const isDashboardContext = typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard");
  const isPreview = extraData?.isPreview ?? isDashboardContext;
  const source = extraData?.source ?? (isDashboardContext ? "simulator" : "public_feed");

  try {
    console.log("[Analytics Dispatching]:", {
      event_type: normType,
      item_id: itemId,
      feed_id: extraData?.feedId || "N/A",
      username: cleanUsername,
      isPreview,
      source,
    });

    fetch("/api/analytics/track", {
      method: "POST",
      mode: "cors",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feed_id: extraData?.feedId,
        username: cleanUsername,
        event_type: normType,
        item_id: itemId,
        link_url: extraData?.linkUrl,
        link_title: extraData?.linkTitle,
        reel_id: extraData?.reelId,
        is_preview: isPreview,
        source: source,
        metadata: extraData?.metadata || {},
      }),
    }).catch((err) => {
      console.warn("[Analytics Client Warning]: Track request failed silently:", err);
    });
  } catch (err) {
    console.warn("[Analytics Client Exception]:", err);
  }
}
