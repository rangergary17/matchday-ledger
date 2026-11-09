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
  { id: "knee-slide", kind: "goal", title: "The knee slide", quip: "Two grass stains. Worth it." },
  { id: "nutmeg", kind: "concede", title: "Through the legs", quip: "He'll be seeing that one in his sleep." },
];

export function pickMoment(kind: MomentKind, seed: string): MomentDef {
  const pool = MOMENTS.filter((m) => m.kind === kind);
  return pool[Math.floor(rng(`moment:${seed}`)() * pool.length)];
}
