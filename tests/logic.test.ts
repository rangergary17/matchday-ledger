import { describe, expect, it } from "vitest";
import { addDays, dateKey, daysBetween, formatCountdown, matchIndexFor, matchdayFor, msUntilMidnight } from "../src/lib/schedule";
import { emptySave, load, recordDaily, recordReplay, save, seasonRecord, streak, type DailyResult } from "../src/lib/results";
import { memoryStore, type KeyValueStore } from "../src/lib/storage";
import { shareText } from "../src/lib/share";

const res = (date: string, goals: boolean[], day = 1): DailyResult => ({ day, date, match: day, goals, hints: 0 });

describe("schedule", () => {
  it("counts calendar days across daylight saving and month ends", () => {
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
    expect(daysBetween("2026-10-31", "2026-11-02")).toBe(2);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
  it("uses the local date, not UTC", () => {
    expect(dateKey(new Date(2026, 10, 2, 23, 59))).toBe("2026-11-02");
    expect(dateKey(new Date(2026, 10, 3, 0, 0))).toBe("2026-11-03");
  });
  it("numbers matchdays from the start date and wraps the season", () => {
    expect(matchdayFor("2026-11-02", "2026-11-02")).toBe(1);
    expect(matchdayFor("2026-10-01", "2026-11-02")).toBe(1);
    expect(matchdayFor("2026-11-15", "2026-11-02")).toBe(14);
    expect(matchIndexFor(30, 30)).toBe(29);
    expect(matchIndexFor(31, 30)).toBe(0);
  });
  it("counts down to local midnight", () => {
    expect(msUntilMidnight(new Date(2026, 10, 2, 23, 0, 0))).toBe(3_600_000);
    expect(formatCountdown(3_723_000)).toBe("01:02:03");
  });
});

describe("streak and record", () => {
  it("counts consecutive days and keeps yesterday's streak alive", () => {
    let d = emptySave();
    d = recordDaily(d, res("2026-11-01", [true, true, false]));
    d = recordDaily(d, res("2026-11-02", [false, false, true]));
    expect(streak(d, "2026-11-02")).toBe(2);
    expect(streak(d, "2026-11-03")).toBe(2);
    expect(streak(d, "2026-11-04")).toBe(0);
    expect(seasonRecord(d)).toEqual({ w: 1, d: 0, l: 1 });
  });
  it("only the first daily finish counts, and replays never count", () => {
    let d = recordDaily(emptySave(), res("2026-11-02", [false, false, false]));
    d = recordDaily(d, res("2026-11-02", [true, true, true]));
    d = recordReplay(d, 1, [true, true, true]);
    expect(seasonRecord(d)).toEqual({ w: 0, d: 0, l: 1 });
    expect(d.daily["2026-11-02"].goals).toEqual([false, false, false]);
  });
});

describe("storage", () => {
  it("survives garbage and a store that throws", () => {
    const s = memoryStore();
    s.set("matchday-ledger:v1", "{not json");
    expect(load(s)).toEqual(emptySave());
    const broken: KeyValueStore = {
      get: () => { throw new Error("blocked"); },
      set: () => { throw new Error("blocked"); },
      remove: () => { throw new Error("blocked"); },
    };
    expect(load(broken)).toEqual(emptySave());
    expect(() => save(broken, emptySave())).not.toThrow();
  });
});

describe("share text", () => {
  it("matches the agreed format and gives nothing away", () => {
    expect(shareText({ day: 14, topic: "Unit Economics", goals: [true, true, false], site: "https://matchdayledger.com/" })).toBe(
      "Matchday Ledger #14 - Unit Economics\n⚽⚽❌ Won 2-1\nmatchdayledger.com",
    );
    expect(shareText({ day: 2, topic: "Churn", goals: [false, true, false], site: "x.com" })).toContain("Lost 1-2");
  });
});
