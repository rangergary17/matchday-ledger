import { inject, pageview } from "@vercel/analytics";

/**
 * Vercel Web Analytics: no cookies, no personal data.
 * Daily players = visitors. Completion rate = "/daily/full-time" views
 * divided by "/daily/kick-off" views. These are sent as page views
 * (not custom events) so they work on the free Hobby plan.
 */
let started = false;

export function startAnalytics(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  try {
    inject({ mode: import.meta.env.PROD ? "production" : "development", debug: false });
  } catch {
    /* analytics must never break the game */
  }
}

export function screen(path: "/daily/kick-off" | "/daily/full-time" | "/replay/kick-off" | "/replay/full-time"): void {
  try {
    pageview({ path, route: path });
  } catch {
    /* ignore */
  }
}
