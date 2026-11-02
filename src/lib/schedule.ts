/**
 * Daily rotation. The match switches at midnight in the player's own
 * time zone. Dates are handled as local YYYY-MM-DD keys and compared as
 * calendar days, so daylight saving changes never skip or repeat a day.
 */

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function keyToUtc(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Whole calendar days from a to b (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((keyToUtc(b) - keyToUtc(a)) / 86_400_000);
}

export function addDays(key: string, n: number): string {
  const d = new Date(keyToUtc(key) + n * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/** Matchday number (1, 2, 3...) for a local date. Days before the start count as matchday 1. */
export function matchdayFor(key: string, startDate: string): number {
  return Math.max(1, daysBetween(startDate, key) + 1);
}

/** Which match (0-based index) plays on a matchday. After the last match the season starts again. */
export function matchIndexFor(day: number, matchCount: number): number {
  return (day - 1) % matchCount;
}

export function dateForMatchday(day: number, startDate: string): string {
  return addDays(startDate, day - 1);
}

/** Milliseconds until the next local midnight. */
export function msUntilMidnight(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(0, next.getTime() - now.getTime());
}

export function formatCountdown(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}
