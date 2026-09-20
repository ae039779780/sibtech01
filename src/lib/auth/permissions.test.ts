import { describe, expect, it } from "vitest";
import {
  can,
  capabilitiesFor,
  isStaffRole,
  parseAccountKind,
  parseRole,
  roleLabel,
} from "./permissions";

describe("demo role matrix", () => {
  it("ships only Retail, Admin, Compliance, and Support", () => {
    expect(parseRole("CUSTOMER")).toBe("CUSTOMER");
    expect(parseRole("ADMIN")).toBe("ADMIN");
    expect(parseRole("COMPLIANCE")).toBe("COMPLIANCE");
    expect(parseRole("SUPPORT")).toBe("SUPPORT");
    expect(parseRole("RISK")).toBe("CUSTOMER");
    expect(isStaffRole("SUPPORT")).toBe(true);
    expect(isStaffRole("CUSTOMER")).toBe(false);
    expect(roleLabel("CUSTOMER")).toBe("Retail");
  });

  it("treats Business as a signup label, not a staff role", () => {
    expect(parseAccountKind("BUSINESS")).toBe("BUSINESS");
    expect(parseAccountKind("PERSONAL")).toBe("PERSONAL");
    expect(isStaffRole("BUSINESS")).toBe(false);
  });

  it("lets Admin freeze, settle, switch partners, decide KYC, and reverse", () => {
    const caps = capabilitiesFor("ADMIN");
    expect(caps.freeze).toBe(true);
    expect(caps.settle).toBe(true);
    expect(caps.rails).toBe(true);
    expect(caps.kyc).toBe(true);
    expect(caps.reverse).toBe(true);
    expect(caps.spread).toBe(true);
    expect(can("ADMIN", "user.freeze")).toBe(true);
  });

  it("lets Compliance own KYC and forbids freeze", () => {
    expect(can("COMPLIANCE", "kyc.decide")).toBe(true);
    expect(can("COMPLIANCE", "staff.console")).toBe(true);
    expect(can("COMPLIANCE", "user.freeze")).toBe(false);
    expect(can("COMPLIANCE", "rails.settle")).toBe(false);
    expect(can("COMPLIANCE", "settings.rails")).toBe(false);
    expect(capabilitiesFor("COMPLIANCE").freeze).toBe(false);
  });

  it("keeps Support view-only: console yes, freeze never", () => {
    const caps = capabilitiesFor("SUPPORT");
    expect(caps.console).toBe(true);
    expect(caps.freeze).toBe(false);
    expect(caps.kyc).toBe(false);
    expect(caps.settle).toBe(false);
    expect(caps.reverse).toBe(false);
    expect(caps.spread).toBe(false);
    expect(caps.rails).toBe(false);
    expect(can("SUPPORT", "user.freeze")).toBe(false);
  });

  it("keeps Retail off the staff console regardless of crypto flag", () => {
    expect(can("CUSTOMER", "staff.console")).toBe(false);
    expect(can("CUSTOMER", "user.freeze")).toBe(false);
    expect(can("CUSTOMER", "kyc.decide")).toBe(false);
  });
});
