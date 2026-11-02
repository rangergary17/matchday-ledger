/**
 * Training ground: spaced repetition. Topics come back for a typed-answer
 * drill with fresh numbers, sooner if you struggled, later as you master them.
 */
import type { SaveData } from "./save";
import { addDays, daysBetween } from "./schedule";

const INTERVALS = [1, 3, 7, 14, 30];
export const MAX_DUE = 3;

export interface Due {
  match: number;
  dueDate: string;
  box: number;
}

export function schedule(data: SaveData): Due[] {
  type Ev = { seq: number; date: string; match: number; full?: boolean; correct?: boolean };
  const evs: Ev[] = [
    ...Object.values(data.records).map((r) => ({ seq: r.seq, date: r.date, match: r.match, full: r.goals.every(Boolean) && r.pen })),
    ...data.drills.map((d) => ({ seq: d.seq, date: d.date, match: d.match, correct: d.correct })),
  ].sort((a, b) => a.seq - b.seq);
  const state = new Map<number, { box: number; last: string }>();
  for (const e of evs) {
    const cur = state.get(e.match);
    if (e.full !== undefined) {
      if (!cur) state.set(e.match, { box: e.full ? 2 : 0, last: e.date });
    } else if (cur) {
      state.set(e.match, { box: e.correct ? Math.min(cur.box + 1, INTERVALS.length - 1) : 0, last: e.date });
    }
  }
  return [...state.entries()].map(([match, s]) => ({ match, box: s.box, dueDate: addDays(s.last, INTERVALS[s.box]) }));
}

/** Drills due today, most overdue first. */
export function dueToday(data: SaveData, today: string): Due[] {
  const doneToday = new Set(data.drills.filter((d) => d.date === today).map((d) => d.match));
  return schedule(data)
    .filter((d) => daysBetween(d.dueDate, today) >= 0 && !doneToday.has(d.match))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.match - b.match)
    .slice(0, MAX_DUE);
}
