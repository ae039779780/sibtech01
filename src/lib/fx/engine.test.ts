import { describe, expect, it } from "vitest";
import { applySpread, midRate, quoteFx } from "./engine";

describe("AFIX quoting", () => {
  it("applies a configurable spread below mid when the customer sells", () => {
    const mid = midRate("CAD", "USD");
    const quote = quoteFx({
      fromCurrency: "CAD",
      toCurrency: "USD",
      amountMinor: 1_360_00n,
      spreadBps: 40,
    });
    expect(quote.spreadBps).toBe(40);
    expect(quote.clientRate).toBe(applySpread(mid, 40, "down"));
    expect(quote.clientRate).toBeLessThan(mid);
    expect(quote.resultMinor).toBeGreaterThan(0n);
  });

  it("keeps BTC conversions on the 8-decimal book", () => {
    const quote = quoteFx({
      fromCurrency: "BTC",
      toCurrency: "CAD",
      amountMinor: 10_000_000n,
      spreadBps: 80,
    });
    expect(quote.resultMinor).toBeGreaterThan(1_000_00n);
  });
});
