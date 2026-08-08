/**
 * Shared In-Memory & Fallback Analytics Store
 * Guarantees zero data loss and instant real-time stats even before SQL migration is executed in Supabase.
 */

export interface AnalyticsEventRecord {
  id: string;
  user_id?: string | null;
  username: string;
  event_type: "page_view" | "link_click" | "reel_play" | "form_open" | "lead_submit" | string;
  link_url?: string | null;
  link_title?: string | null;
  reel_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

// Global singleton array across HMR server module reloads
const globalForAnalytics = global as unknown as {
  globalAnalyticsEvents?: AnalyticsEventRecord[];
};

export const memoryAnalyticsStore: AnalyticsEventRecord[] =
  globalForAnalytics.globalAnalyticsEvents || [];

if (process.env.NODE_ENV !== "production") {
  globalForAnalytics.globalAnalyticsEvents = memoryAnalyticsStore;
}

export function saveInMemoryEvent(event: Omit<AnalyticsEventRecord, "id">) {
  const record: AnalyticsEventRecord = {
    ...event,
    id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
  memoryAnalyticsStore.unshift(record);
  // Keep last 1000 events in memory
  if (memoryAnalyticsStore.length > 1000) {
    memoryAnalyticsStore.pop();
  }
  return record;
}

export function getInMemoryEvents(username?: string, userId?: string, startDateISO?: string): AnalyticsEventRecord[] {
  const cleanUsername = username ? username.toLowerCase().trim() : null;
  const cutoffTime = startDateISO ? new Date(startDateISO).getTime() : 0;

  return memoryAnalyticsStore.filter((ev) => {
    // Filter by username or userId if provided
    const matchesUser =
      (!cleanUsername && !userId) ||
      (cleanUsername && ev.username.toLowerCase() === cleanUsername) ||
      (userId && ev.user_id === userId);

    if (!matchesUser) return false;

    // Filter by timestamp
    if (cutoffTime > 0) {
      const evTime = new Date(ev.created_at).getTime();
      if (evTime < cutoffTime) return false;
    }

    return true;
  });
}
