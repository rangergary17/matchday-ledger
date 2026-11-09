import { describe, expect, it } from "vitest";
import { addDays, dateKey, daysBetween, formatCountdown, matchIndexFor, matchdayFor, msUntilMidnight } from "../src/lib/schedule";
import { emptySave, load, outcome, recordCall, recordDrill, recordMatch, recordReplay, save, score, streak, type SaveData } from "../src/lib/save";
import { memoryStore, type KeyValueStore } from "../src/lib/storage";
import { shareText } from "../src/lib/share";
import { buildClub, matchdayProfit, RESULT } from "../src/lib/club";
import { table } from "../src/lib/league";
import { ratings, tier } from "../src/lib/skills";
import { dueToday } from "../src/lib/drills";
import { format, parseInput } from "../src/lib/template";
import { pack } from "../src/lib/content";

const { season, matches } = pack;
const play = (d: SaveData, day: number, date: string, goals: boolean[], pen: boolean, kind: "daily" | "catchup" = "daily") =>
  recordMatch(d, { day, date, match: matches[(day - 1) % 30].number, kind, goals, pen, hints: 0 });

describe("schedule", () => {
  it("counts calendar days across daylight saving and month ends", () => {
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
  it("uses the local date and wraps the season", () => {
    expect(dateKey(new Date(2026, 10, 2, 23, 59))).toBe("2026-11-02");
    expect(matchdayFor("2026-11-15", "2026-11-02")).toBe(14);
    expect(matchdayFor("2026-10-01", "2026-11-02")).toBe(1);
    expect(matchIndexFor(31, 30)).toBe(0);
  });
  it("counts down to local midnight", () => {
    expect(msUntilMidnight(new Date(2026, 10, 2, 23, 0, 0))).toBe(3_600_000);
    expect(formatCountdown(3_723_000)).toBe("01:02:03");
  });
});

describe("scoring", () => {
  it("the penalty makes draws possible", () => {
    expect(score([true, false, false], true)).toEqual({ us: 2, them: 2 });
    expect(outcome([true, false, false], true)).toBe("draw");
    expect(outcome([true, true, false], false)).toBe("win");
  });
});

describe("save, streak and replays", () => {
  it("counts the daily streak, not catch-ups", () => {
    let d = play(emptySave(), 1, "2026-11-02", [true, true, true], true);
    d = play(d, 2, "2026-11-03", [false, false, false], false);
    d = play(d, 3, "2026-11-05", [true, false, true], true, "catchup");
    expect(streak(d, "2026-11-03")).toBe(2);
    expect(streak(d, "2026-11-04")).toBe(2);
    expect(streak(d, "2026-11-05")).toBe(0);
  });
  it("a matchday counts once, and replays never count", () => {
    let d = play(emptySave(), 1, "2026-11-02", [false, false, false], false);
    d = play(d, 1, "2026-11-02", [true, true, true], true);
    d = recordReplay(d, 1, [true, true, true], true);
    expect(d.records["1"].goals).toEqual([false, false, false]);
    expect(buildClub(Object.values(d.records), matches, season).played).toHaveLength(1);
  });
  it("survives garbage and a store that throws", () => {
    const s = memoryStore();
    s.set("bizball:v1", "{not json");
    expect(load(s)).toEqual(emptySave());
    const broken: KeyValueStore = { get: () => { throw new Error("x"); }, set: () => { throw new Error("x"); }, remove: () => { throw new Error("x"); } };
    expect(load(broken)).toEqual(emptySave());
    expect(() => save(broken, emptySave())).not.toThrow();
  });
});

describe("club", () => {
  it("applies result, takings and the call in order", () => {
    let d = play(emptySave(), 1, "2026-11-02", [true, true, false], true);
    const before = buildClub(Object.values(d.records), matches, season);
    const s0 = season.club.start;
    const afterResult = { ...s0, fans: s0.fans + RESULT.win.fans };
    expect(before.state.cash).toBe(s0.cash + RESULT.win.cash + matchdayProfit(afterResult));
    expect(before.pendingCalls).toHaveLength(1);
    d = recordCall(d, 1, matches[0].call.best);
    const after = buildClub(Object.values(d.records), matches, season);
    expect(after.pendingCalls).toHaveLength(0);
    expect(after.state.board).toBe(s0.board + RESULT.win.board + 3);
  });
  it("later consequences land after the right number of matchdays", () => {
    const m = matches.find((x) => x.call.options.some((o) => o.later && o.later.after === 3))!;
    const day = m.number;
    const pick = m.call.options.findIndex((o) => o.later && o.later.after === 3);
    let d = play(emptySave(), day, "2026-11-05", [true, true, true], true);
    d = recordCall(d, day, pick);
    const cashAt = (x: SaveData) => buildClub(Object.values(x.records), matches, season).news.filter((n) => n.kind === "event").length;
    d = play(d, day + 1, "2026-11-06", [true, true, true], true);
    d = play(d, day + 2, "2026-11-07", [true, true, true], true);
    expect(cashAt(d)).toBe(0);
    d = play(d, day + 3, "2026-11-08", [true, true, true], true);
    expect(cashAt(d)).toBe(1);
  });
});

describe("league", () => {
  it("has 31 teams, the same for everyone, and counts your result", () => {
    const d = play(emptySave(), 1, "2026-11-02", [true, true, true], true);
    const t = table(season.club.name, matches, Object.values(d.records), 1);
    expect(t).toHaveLength(31);
    const you = t.find((r) => r.you)!;
    expect(you.pts).toBe(3);
    expect(t.find((r) => r.team === matches[0].opponent)!.pts).toBe(0);
    expect(table(season.club.name, matches, Object.values(d.records), 1)).toEqual(t);
  });
  it("other teams play every day before today", () => {
    const t = table(season.club.name, matches, [], 5);
    const others = t.filter((r) => !r.you);
    expect(others.every((r) => r.p >= 3 && r.p <= 4)).toBe(true);
  });
});

describe("skills and drills", () => {
  it("ratings start at 40 and rise with mastery", () => {
    expect(ratings(emptySave(), matches, season).overall).toBe(40);
    const d = play(emptySave(), 1, "2026-11-02", [true, true, true], true);
    const r = ratings(d, matches, season);
    expect(r.skills.find((s) => s.key === matches[0].skill)!.rating).toBeGreaterThan(40);
    expect(tier(40)).toBe("bronze");
  });
  it("missed topics come back tomorrow, mastered ones in a week", () => {
    let d = play(emptySave(), 1, "2026-11-02", [true, false, true], true);
    d = play(d, 2, "2026-11-03", [true, true, true], true);
    expect(dueToday(d, "2026-11-03").map((x) => x.match)).toEqual([1]);
    d = recordDrill(d, 1, "2026-11-03", true);
    expect(dueToday(d, "2026-11-03")).toEqual([]);
    expect(dueToday(d, "2026-11-10").map((x) => x.match).sort()).toEqual([1, 2]);
  });
});

describe("input and formatting", () => {
  it("reads what players type", () => {
    expect(parseInput("$1,200")).toBe(1200);
    expect(parseInput("1.2m")).toBe(1_200_000);
    expect(parseInput("500K")).toBe(500_000);
    expect(parseInput("64%")).toBe(64);
    expect(parseInput("abc")).toBeNull();
  });
  it("only shortens millions when exact", () => {
    expect(format(5_500_000, "usd")).toBe("$5.5M");
    expect(format(5_244_000, "usd")).toBe("$5,244,000");
    expect(format(0.333, "pct")).toBe("33.3%");
  });
});

describe("share text", () => {
  it("is spoiler-free and shows the penalty", () => {
    expect(shareText({ day: 14, topic: "Unit Economics", goals: [true, true, false], pen: true, site: "https://matchdayledger.com/", rating: 64, position: "4th" })).toBe(
      "BizBall #14 - Unit Economics\n⚽⚽❌ pen ⚽ Won 3-1\nRating 64 · 4th in the league\nmatchdayledger.com",
    );
  });
});
