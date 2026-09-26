import { describe, expect, it } from "vitest";
import { getRailsPartner, listRailsAdapters, parseRailsProvider } from "./index";
import { ThunesRailsPartner } from "./thunes";
import { TerraPayRailsPartner } from "./terrapay";

describe("RailsPartner factory", () => {
  it("defaults to the Thunes stub", () => {
    expect(parseRailsProvider(undefined)).toBe("thunes");
    expect(getRailsPartner().id).toBe("thunes");
    expect(getRailsPartner()).toBeInstanceOf(ThunesRailsPartner);
  });

  it("switches to TerraPay / Terra Rail without changing the interface", () => {
    const partner = getRailsPartner("terrapay");
    expect(partner).toBeInstanceOf(TerraPayRailsPartner);
    expect(partner.id).toBe("terrapay");
    expect(partner.displayName).toMatch(/Terra/);
  });

  it("exposes both adapters for MVP partner selection", () => {
    const ids = listRailsAdapters().map((a) => a.id).sort();
    expect(ids).toEqual(["terrapay", "thunes"]);
  });
});

describe("stub corridors", () => {
  it("lists only Bank, Push2card, and UPI payout corridors", async () => {
    const kinds = new Set((await new ThunesRailsPartner().listCorridors()).map((c) => c.kind));
    expect([...kinds].sort()).toEqual(["BANK", "PUSH2CARD", "UPI"]);
  });

  it("issues bank payout references (SWIFT-like sits under Bank)", async () => {
    const thunes = new ThunesRailsPartner();
    const bank = await thunes.createPayout({
      userId: "user_1",
      amountMinor: 25_000_00n,
      currency: "EUR",
      method: "BANK",
      country: "DE",
      beneficiaryName: "Northwind Ltd",
      iban: "DE89TEST",
      swiftBic: "COBADEFFXXX",
      idempotencyKey: "k1",
    });
    expect(bank.partnerRef.startsWith("THN-")).toBe(true);
    expect(bank.status).toBe("ACCEPTED");
    expect(bank.method).toBe("BANK");
    expect(bank.corridor).toBe("bank-eur");

    const terra = new TerraPayRailsPartner();
    const local = await terra.createPayin({
      userId: "user_1",
      amountMinor: 100_00n,
      currency: "CAD",
      method: "LOCAL",
      country: "CA",
      idempotencyKey: "k2",
    });
    expect(local.partnerRef.startsWith("TRP-")).toBe(true);
    expect(local.instructions.reference).toContain("SIB-");
  });

  it("rejects bank payouts without routing data", async () => {
    const partner = new ThunesRailsPartner();
    await expect(
      partner.createPayout({
        userId: "user_1",
        amountMinor: 10_00n,
        currency: "EUR",
        method: "BANK",
        country: "DE",
        beneficiaryName: "No Rails",
        idempotencyKey: "k3",
      }),
    ).rejects.toThrow(/account number or IBAN/);
  });
});
