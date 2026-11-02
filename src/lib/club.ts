/**
 * The club simulation. Worked out fresh from the match records every
 * time, in the order matches were finished.
 *
 * Each finished match:
 *   1. result: prize money, fans and board mood
 *   2. matchday takings: fans x profit per fan - fixed costs (lesson 1, every day)
 *   3. consequences of earlier calls that are now due
 *   4. the Chairman's call, if made
 */
import type { ClubState, Effects, Match, Season } from "./types";
import { outcome, type MatchRecord } from "./save";

export const RESULT = {
  win: { cash: 30000, fans: 150, board: 4 },
  draw: { cash: 10000, fans: 0, board: 1 },
  loss: { cash: 0, fans: -100, board: -4 },
} as const;
export const GOOD_CALL_BOARD = 3;
export const BAD_CALL_BOARD = -2;
export const MIN_FANS = 2000;

export interface NewsItem {
  day: number;
  kind: "result" | "takings" | "call" | "event" | "warning";
  text: string;
  cash?: number;
  fans?: number;
}

export interface Club {
  state: ClubState;
  news: NewsItem[];
  /** Matchdays played, in order. */
  played: MatchRecord[];
  /** Matches finished but with no Chairman's call made yet. */
  pendingCalls: MatchRecord[];
}

export function matchdayProfit(s: ClubState): number {
  return s.fans * s.contrib - s.fixed;
}

export function applyEffects(s: ClubState, e: Effects, capacity: number): ClubState {
  return clamp(
    {
      ...s,
      cash: s.cash + (e.cash ?? 0),
      fans: s.fans + (e.fans ?? 0),
      contrib: s.contrib + (e.contrib ?? 0),
      fixed: s.fixed + (e.fixed ?? 0),
    },
    capacity,
  );
}

function clamp(s: ClubState, capacity: number): ClubState {
  return {
    ...s,
    fans: Math.max(MIN_FANS, Math.min(capacity, Math.round(s.fans))),
    board: Math.max(0, Math.min(100, Math.round(s.board))),
  };
}

/** What a set of effects is worth over the next n matchdays, starting from a club state. */
export function valueOver(s: ClubState, e: Effects, n: number, capacity: number): number {
  const after = applyEffects(s, e, capacity);
  return (e.cash ?? 0) + n * (matchdayProfit(after) - matchdayProfit(s));
}

export function buildClub(records: MatchRecord[], matches: Match[], season: Season): Club {
  const cap = season.club.capacity;
  let s: ClubState = { ...season.club.start };
  const news: NewsItem[] = [];
  const played = [...records].sort((a, b) => a.seq - b.seq);
  const pending: { due: number; text: string; effects: Effects; day: number }[] = [];
  const byNumber = new Map(matches.map((m) => [m.number, m]));

  played.forEach((r, i) => {
    const m = byNumber.get(r.match);
    if (!m) return;
    const o = outcome(r.goals, r.pen);
    const res = RESULT[o];
    s = clamp({ ...s, cash: s.cash + res.cash, fans: s.fans + res.fans, board: s.board + res.board }, cap);
    news.push({
      day: r.day,
      kind: "result",
      text: o === "win" ? `Beat ${m.opponent}. Prize money and a few more fans.` : o === "draw" ? `Drew with ${m.opponent}.` : `Lost to ${m.opponent}. Some fans stayed home.`,
      cash: res.cash || undefined,
      fans: res.fans || undefined,
    });

    const takings = matchdayProfit(s);
    s = { ...s, cash: s.cash + takings };
    news.push({ day: r.day, kind: "takings", text: "Matchday takings after costs", cash: takings });

    for (const ev of pending.filter((p) => p.due <= i + 1)) {
      s = applyEffects(s, ev.effects, cap);
      news.push({ day: r.day, kind: "event", text: ev.text, cash: ev.effects.cash, fans: ev.effects.fans });
    }
    for (let k = pending.length - 1; k >= 0; k--) if (pending[k].due <= i + 1) pending.splice(k, 1);

    if (r.call !== null && m.call.options[r.call]) {
      const opt = m.call.options[r.call];
      const good = r.call === m.call.best;
      s = applyEffects(s, opt.effects, cap);
      s = clamp({ ...s, board: s.board + (good ? GOOD_CALL_BOARD : BAD_CALL_BOARD) }, cap);
      news.push({ day: r.day, kind: "call", text: `${m.call.title}: ${opt.label}`, cash: opt.effects.cash, fans: opt.effects.fans });
      if (opt.later) pending.push({ due: i + 1 + opt.later.after, text: opt.later.text, effects: opt.later.effects, day: r.day });
    }

    if (s.cash < 0) {
      s = clamp({ ...s, board: s.board - 5 }, cap);
      news.push({ day: r.day, kind: "warning", text: "The bank account is overdrawn. The board is worried." });
    }
  });

  return { state: s, news, played, pendingCalls: played.filter((r) => r.call === null) };
}
