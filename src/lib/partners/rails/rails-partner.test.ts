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
  it("issues SWIFT and local payout references", async () => {
    const thunes = new ThunesRailsPartner();
    const swift = await thunes.createPayout({
      userId: "user_1",
      amountMinor: 25_000_00n,
      currency: "USD",
      method: "SWIFT",
      country: "US",
      beneficiaryName: "Northwind Ltd",
      iban: "US00TEST",
      swiftBic: "CHASUS33",
      idempotencyKey: "k1",
    });
    expect(swift.partnerRef.startsWith("THN-")).toBe(true);
    expect(swift.status).toBe("ACCEPTED");
    expect(swift.method).toBe("SWIFT");

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

  it("rejects SWIFT payouts without routing data", async () => {
    const partner = new ThunesRailsPartner();
    await expect(
      partner.createPayout({
        userId: "user_1",
        amountMinor: 10_00n,
        currency: "EUR",
        method: "SWIFT",
        country: "DE",
        beneficiaryName: "No Rails",
        idempotencyKey: "k3",
      }),
    ).rejects.toThrow(/IBAN or BIC/);
  });
});
