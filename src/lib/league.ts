/**
 * The league: you plus the 30 opponents. Your results are real. Every other
 * result is simulated from a fixed seed, so everyone sees the same table.
 */
import type { Match } from "./types";
import { outcome, type MatchRecord } from "./save";
import { rng } from "./template";

export interface Row {
  team: string;
  you: boolean;
  p: number;
  w: number;
  d: number;
  l: number;
  pts: number;
}

export function strength(team: string): number {
  return 0.35 + rng(`strength:${team}`)() * 0.3;
}

export function seasonOf(day: number, length: number): number {
  return Math.floor((day - 1) / length);
}

/**
 * Table for the season that contains `today`. Other teams' results count for
 * every matchday before today, and today's once you've played.
 */
export function table(club: string, matches: Match[], records: MatchRecord[], today: number): Row[] {
  const n = matches.length;
  const season = seasonOf(today, n);
  const first = season * n + 1;
  const rows = new Map<string, Row>();
  const row = (team: string, you = false) => {
    if (!rows.has(team)) rows.set(team, { team, you, p: 0, w: 0, d: 0, l: 0, pts: 0 });
    return rows.get(team)!;
  };
  const add = (r: Row, o: "win" | "draw" | "loss") => {
    r.p++;
    if (o === "win") { r.w++; r.pts += 3; } else if (o === "draw") { r.d++; r.pts += 1; } else r.l++;
  };
  row(club, true);
  matches.forEach((m) => row(m.opponent));
  const mine = new Map(records.filter((r) => seasonOf(r.day, n) === season).map((r) => [r.day, r]));

  for (let day = first; day <= Math.min(today, first + n - 1); day++) {
    const rec = mine.get(day);
    if (day === today && !rec) continue;
    const opp = matches[(day - 1) % n].opponent;
    if (rec) {
      const o = outcome(rec.goals, rec.pen);
      add(row(club), o);
      add(row(opp), o === "win" ? "loss" : o === "loss" ? "win" : "draw");
    }
    for (const m of matches) {
      if (m.opponent === opp) continue;
      const s = strength(m.opponent);
      const x = rng(`s${season}:d${day}:${m.opponent}`)();
      const pw = s * 0.75 - 0.05;
      add(row(m.opponent), x < pw ? "win" : x < pw + 0.27 ? "draw" : "loss");
    }
  }
  return [...rows.values()].sort((a, b) => b.pts - a.pts || b.w - a.w || a.l - b.l || (a.you ? -1 : b.you ? 1 : a.team.localeCompare(b.team)));
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
