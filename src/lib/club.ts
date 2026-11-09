/**
 * The club simulation. Worked out fresh from the match records every
 * time, in the order matches were finished.
 *
 * Each finished match:
 *   1. result: prize money, fans and board mood
 *   2. matchday takings: fans x profit per fan - fixed costs
 *   3. consequences of earlier calls that are now due
 *   4. the Chairman's call, if made
 *
 * Your wealth = money you've banked + your stake x what the club is worth,
 * where the club is worth multiple x yearly profit + cash - debt.
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

export interface Cfg {
  capacity: number;
  multiple: number;
  matchdaysPerYear: number;
}

export function cfgOf(season: Season): Cfg {
  return { capacity: season.club.capacity, multiple: season.multiple, matchdaysPerYear: season.matchdaysPerYear };
}

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
  played: MatchRecord[];
  pendingCalls: MatchRecord[];
}

export function matchdayProfit(s: ClubState): number {
  return s.fans * s.contrib - s.fixed;
}

/** Enterprise value: what the business is worth before cash and debt. */
export function clubValue(s: ClubState, c: Cfg, multiple = c.multiple): number {
  return Math.max(0, multiple * c.matchdaysPerYear * matchdayProfit(s));
}

/** What the owners' shares are worth: club value plus cash minus debt. */
export function equityValue(s: ClubState, c: Cfg, multiple = c.multiple): number {
  return Math.max(0, clubValue(s, c, multiple) + s.cash - s.debt);
}

export function wealth(s: ClubState, c: Cfg): number {
  return s.banked + s.stake * equityValue(s, c);
}

function clamp(s: ClubState, capacity: number): ClubState {
  return {
    ...s,
    fans: Math.max(MIN_FANS, Math.min(capacity, Math.round(s.fans))),
    board: Math.max(0, Math.min(100, Math.round(s.board))),
    stake: Math.max(0, Math.min(1, s.stake)),
  };
}

export function applyEffects(s0: ClubState, e: Effects, c: Cfg): ClubState {
  let s = { ...s0 };
  if (e.sellFraction) {
    const f = Math.min(1, e.sellFraction);
    s.banked += s.stake * f * equityValue(s, c, e.sellMultiple ?? c.multiple);
    s.stake *= 1 - f;
  }
  if (e.dilute) s.stake *= 1 - e.dilute;
  if (e.recap) {
    s.banked += s.stake * e.recap;
    s.debt += e.recap;
  }
  s.debt = Math.max(0, s.debt + (e.debt ?? 0));
  s.banked += e.banked ?? 0;
  s = {
    ...s,
    cash: s.cash + (e.cash ?? 0),
    fans: s.fans + (e.fans ?? 0),
    contrib: s.contrib + (e.contrib ?? 0),
    fixed: s.fixed + (e.fixed ?? 0),
  };
  return clamp(s, c.capacity);
}

/**
 * Your wealth after `n` more matchdays if you make this choice now:
 * banked money, plus your stake of the club's value, cash and the profit
 * those matchdays earn. Used by the tests to prove the "best" call is best.
 */
export function projectWealth(s0: ClubState, e: Effects, later: { after: number; effects: Effects } | undefined, n: number, c: Cfg): number {
  let s = applyEffects(s0, e, c);
  let earned = 0;
  if (later && later.after < n) {
    earned += later.after * matchdayProfit(s);
    s = applyEffects(s, later.effects, c);
    earned += (n - later.after) * matchdayProfit(s);
  } else {
    earned += n * matchdayProfit(s);
  }
  return s.banked + s.stake * Math.max(0, clubValue(s, c) + s.cash + earned - s.debt);
}

export function buildClub(records: MatchRecord[], matches: Match[], season: Season): Club {
  const c = cfgOf(season);
  let s: ClubState = { ...season.club.start };
  const news: NewsItem[] = [];
  const played = [...records].sort((a, b) => a.seq - b.seq);
  const pending: { due: number; text: string; effects: Effects }[] = [];
  const byNumber = new Map(matches.map((m) => [m.number, m]));

  played.forEach((r, i) => {
    const m = byNumber.get(r.match);
    if (!m) return;
    const o = outcome(r.goals, r.pen);
    const res = RESULT[o];
    s = clamp({ ...s, cash: s.cash + res.cash, fans: s.fans + res.fans, board: s.board + res.board }, c.capacity);
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
      s = applyEffects(s, ev.effects, c);
      news.push({ day: r.day, kind: "event", text: ev.text, cash: ev.effects.cash, fans: ev.effects.fans });
    }
    for (let k = pending.length - 1; k >= 0; k--) if (pending[k].due <= i + 1) pending.splice(k, 1);

    if (r.call !== null && m.call.options[r.call]) {
      const opt = m.call.options[r.call];
      const good = r.call === m.call.best;
      const before = s.banked;
      s = applyEffects(s, opt.effects, c);
      s = clamp({ ...s, board: s.board + (good ? GOOD_CALL_BOARD : BAD_CALL_BOARD) }, c.capacity);
      news.push({ day: r.day, kind: "call", text: `${m.call.title}: ${opt.label}`, cash: opt.effects.cash, fans: opt.effects.fans });
      if (s.banked > before) news.push({ day: r.day, kind: "event", text: "Paid to you personally", cash: s.banked - before });
      if (opt.later) pending.push({ due: i + 1 + opt.later.after, text: opt.later.text, effects: opt.later.effects });
    }

    if (s.cash < 0) {
      s = clamp({ ...s, board: s.board - 5 }, c.capacity);
      news.push({ day: r.day, kind: "warning", text: "The bank account is overdrawn. The board is worried." });
    }
  });

  return { state: s, news, played, pendingCalls: played.filter((r) => r.call === null) };
}
