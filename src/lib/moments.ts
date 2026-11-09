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
}

export const MOMENTS: MomentDef[] = [
  { id: "thunderbolt", kind: "goal", title: "The captain's thunderbolt", quip: "Thirty-five yards, deep in stoppage time. Of course it was him." },
  { id: "rain-slide", kind: "goal", title: "The rain slide", quip: "He has been praying for a wet pitch all season." },
  { id: "the-slip", kind: "concede", title: "The slip", quip: "Rain, a final, the winning kick. The grass had other plans." },
  { id: "last-act", kind: "concede", title: "The last act", quip: "Fifteen years of genius. Everyone will remember the chest." },
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
