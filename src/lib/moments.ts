/**
 * Goal and concede moments: short animated vignettes with a caption.
 * Original drawings that nod to famous football moments. No real
 * footage, clubs or players. Everyone sees the same one for the same
 * chance on the same day, so people can talk about it.
 */
import { rng } from "./template";

export type MomentKind = "goal" | "concede";

export interface MomentDef {
  id: string;
  kind: MomentKind;
  title: string;
  quip: string;
  /** Optional video clip in public/moments/. Plays instead of the drawn scene when it loads in time. */
  video?: string;
  /** For a clip: when the ball hits the net (or the bad moment lands), in ms. */
  beat?: number;
  /** For a clip: how long the moment stays up, in ms. */
  length?: number;
  /** Still frame shown when a clip-only moment cannot play its clip. */
  poster?: string;
}

export const MOMENTS: MomentDef[] = [
  { id: "thunderbolt", kind: "goal", title: "The captain's thunderbolt", quip: "Thirty-five yards, deep in stoppage time. Of course it was him.", video: "thunderbolt.mp4", beat: 3000, length: 8000 },
  { id: "rain-slide", kind: "goal", title: "The knee slide", quip: "Forty yards of perfect grass, and he used every blade.", video: "rain-slide.mp4", beat: 1100, length: 12600 },
  { id: "into-the-crowd", kind: "goal", title: "Into the crowd", quip: "He scored for them. Now he belongs to them.", video: "into-the-crowd.mp4", beat: 1100, length: 8000, poster: "into-the-crowd.jpg" },
  { id: "overhead", kind: "goal", title: "The overhead", quip: "Upside down, back to goal, top corner. Physics was consulted afterwards.", video: "overhead.mp4", beat: 1600, length: 8000 },
  { id: "the-chip", kind: "goal", title: "The chip", quip: "The keeper went early. The ball took its time.", video: "the-chip.mp4", beat: 4000, length: 8000 },
  { id: "the-slip", kind: "concede", title: "The slip", quip: "Rain, a final, the winning kick. The grass had other plans.", video: "the-slip.mp4", beat: 2200, length: 8000 },
  { id: "last-act", kind: "concede", title: "The last act", quip: "Fifteen years of genius. Everyone will remember the chest.", video: "last-act.mp4", beat: 5000, length: 8000 },
  { id: "own-goal", kind: "concede", title: "The own goal", quip: "Perfect header. Wrong net.", video: "own-goal.mp4", beat: 2400, length: 8000 },
  { id: "scorpion", kind: "concede", title: "The scorpion save", quip: "Their keeper had time to show off. Your answer gave it to him.", video: "scorpion.mp4", beat: 2800, length: 8000 },
];

export function pickMoment(kind: MomentKind, seed: string): MomentDef {
  const pool = MOMENTS.filter((m) => m.kind === kind);
  return pool[Math.floor(rng(`moment:${seed}`)() * pool.length)];
}

/** `?moment=<id>` plays one moment straight away, for previews and screenshots. */
export function previewMoment(): MomentDef | null {
  if (typeof location === "undefined") return null;
  const id = new URLSearchParams(location.search).get("moment");
  return MOMENTS.find((m) => m.id === id) ?? null;
}

const warmed = new Set<string>();
/**
 * Fetch the clips a chance could trigger (its goal and its concede) while
 * the player reads the question, so they start instantly. Skipped on data
 * saver and for reduced motion, where the clips never play.
 */
export function warmClips(seed: string): void {
  if (typeof window === "undefined" || typeof fetch !== "function") return;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const kind of ["goal", "concede"] as const) {
    const v = pickMoment(kind, seed).video;
    if (!v || warmed.has(v)) continue;
    warmed.add(v);
    fetch(`/moments/${v}`).catch(() => warmed.delete(v));
  }
}
