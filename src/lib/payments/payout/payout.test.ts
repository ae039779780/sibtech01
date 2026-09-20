import { describe, expect, it } from "vitest";
import { ThunesRailsPartner } from "@/lib/partners/rails/thunes";
import { PAYOUT_CORRIDORS } from "@/lib/partners/rails/stub-engine";
import {
  assertNotPan,
  isPartnerCardToken,
  listPayoutMethods,
  looksLikePan,
  parsePayoutMethod,
  validatePayoutDestination,
} from "./index";

describe("payout corridors", () => {
  it("exposes only Bank, Push2card, and UPI", () => {
    expect(listPayoutMethods().map((m) => m.id)).toEqual(["BANK", "PUSH2CARD", "UPI"]);
    expect(parsePayoutMethod("SWIFT")).toBe("BANK");
    expect(parsePayoutMethod("LOCAL")).toBe("BANK");
    expect(() => parsePayoutMethod("CRYPTO")).toThrow(/Bank, Push2card, or UPI/);
    expect(() => parsePayoutMethod("WIRE")).toThrow(/Bank, Push2card, or UPI/);
  });

  it("never stores a PAN for push2card", () => {
    expect(looksLikePan("4111111111111111")).toBe(true);
    expect(looksLikePan("4111 1111 1111 1111")).toBe(true);
    expect(() => assertNotPan("4111111111111111")).toThrow(/PAN/);
    expect(isPartnerCardToken("tok_thunes_demo_4418")).toBe(true);
    expect(isPartnerCardToken("4111111111111111")).toBe(false);
    expect(() =>
      validatePayoutDestination("PUSH2CARD", {
        name: "Maya",
        cardToken: "4111111111111111",
      }),
    ).toThrow(/PAN/);
  });

  it("validates bank account details and UPI VPA", () => {
    expect(() => validatePayoutDestination("BANK", { name: "RBC" })).toThrow(/account number or IBAN/);
    validatePayoutDestination("BANK", { name: "RBC", accountNumber: "4510028841" });
    expect(() => validatePayoutDestination("UPI", { name: "Priya", upiVpa: "not-a-vpa" })).toThrow(/VPA/);
    validatePayoutDestination("UPI", { name: "Priya", upiVpa: "priya.sharma@oksbi" });
  });

  it("hints Thunes for push2card without inventing a fourth rail", () => {
    const push = listPayoutMethods().find((m) => m.id === "PUSH2CARD");
    expect(push?.preferredPartner).toBe("thunes");
    const kinds = new Set(PAYOUT_CORRIDORS.map((c) => c.kind));
    expect([...kinds].sort()).toEqual(["BANK", "PUSH2CARD", "UPI"]);
  });
});

describe("RailsPartner payout stubs", () => {
  it("accepts the three demo payout methods and rejects a PAN", async () => {
    const thunes = new ThunesRailsPartner();
    const bank = await thunes.createPayout({
      userId: "user_1",
      amountMinor: 50_00n,
      currency: "CAD",
      method: "BANK",
      country: "CA",
      beneficiaryName: "Jordan Ellison — RBC",
      accountNumber: "4510028841",
      idempotencyKey: "p1",
    });
    expect(bank.status).toBe("ACCEPTED");
    expect(bank.method).toBe("BANK");
    expect(bank.corridor).toBe("bank-cad");

    const card = await thunes.createPayout({
      userId: "user_1",
      amountMinor: 25_00n,
      currency: "USD",
      method: "PUSH2CARD",
      country: "US",
      beneficiaryName: "Maya Chen",
      cardToken: "tok_thunes_demo_4418",
      cardLast4: "4418",
      idempotencyKey: "p2",
    });
    expect(card.corridor).toMatch(/push2card/);

    const upi = await thunes.createPayout({
      userId: "user_1",
      amountMinor: 10_00n,
      currency: "CAD",
      method: "UPI",
      country: "IN",
      beneficiaryName: "Priya Sharma",
      upiVpa: "priya.sharma@oksbi",
      idempotencyKey: "p3",
    });
    expect(upi.corridor).toBe("upi-in");

    await expect(
      thunes.createPayout({
        userId: "user_1",
        amountMinor: 10_00n,
        currency: "USD",
        method: "PUSH2CARD",
        country: "US",
        beneficiaryName: "No",
        cardToken: "4111111111111111",
        idempotencyKey: "p4",
      }),
    ).rejects.toThrow(/PAN/);
  });
});
