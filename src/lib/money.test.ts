import { describe, expect, it } from "vitest";
import { fromMinor, toMinor } from "./money";

describe("money helpers", () => {
  it("round-trips CAD cents", () => {
    expect(toMinor("12450.00", 2)).toBe(1_245_000n);
    expect(fromMinor(1_245_000n, 2)).toBe("12450.00");
  });

  it("round-trips BTC sat-scale amounts", () => {
    expect(toMinor("0.08420000", 8)).toBe(8_420_000n);
    expect(fromMinor(8_420_000n, 8)).toBe("0.08420000");
  });
});
