import { describe, expect, it } from "vitest";
import { checkWorking } from "./support/working";
import { evaluate, parseOption } from "../src/lib/calc";

describe("the working checker itself", () => {
  it("accepts correct sums", () => {
    expect(checkWorking("$30 - $12 = $18 per fan.").issues).toEqual([]);
    expect(checkWorking("(9 x $1.2M) + (3 x $0.3M) = $10.8M + $0.9M = $11.7M.").issues).toEqual([]);
    expect(checkWorking("$3.5M / $5.5M = about 64%.").issues).toEqual([]);
    expect(checkWorking("-$45K + $21K = -$24K.").issues).toEqual([]);
    expect(checkWorking("$12M x 2% = $240,000, all profit.").issues).toEqual([]);
  });
  it("catches wrong sums", () => {
    expect(checkWorking("$30 - $12 = $17 per fan.").issues).toHaveLength(1);
    expect(checkWorking("$240,000 / $18 = 13,333 fans.").issues).toHaveLength(1);
    expect(checkWorking("$3.5M / $5.5M = about 70%.").issues).toHaveLength(1);
  });
  it("leaves prose alone", () => {
    expect(checkWorking("Fan number 5,001 is the first one making you money.").issues).toEqual([]);
    expect(checkWorking("A one-day lag, 3-day window, 40% of fans.").issues).toEqual([]);
  });
  it("evaluates formulas and reads options", () => {
    expect(evaluate("(price - cost) * fans", { price: 30, cost: 12, fans: 10 })).toBe(180);
    expect(parseOption("About 64%")).toEqual({ value: 0.64, unit: 0.01 });
    expect(parseOption("$4.5M")!.value).toBe(4_500_000);
    expect(parseOption("Raise prices")).toBeNull();
  });
});
