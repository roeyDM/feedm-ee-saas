/**
 * Google Tag Manager DataLayer Event Helper
 */

declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
  }
}

export function pushToDataLayer(eventPayload: Record<string, any>) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventPayload);
  }
}
