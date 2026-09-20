import { describe, expect, it } from "vitest";
import {
  actorCan,
  can,
  capabilitiesFor,
  isCustomerRole,
  isStaffRole,
  parseAccountKind,
  parseRole,
  roleLabel,
  ROLES,
} from "./permissions";

describe("Sibtech 10-role matrix", () => {
  it("enumerates all 10 roles", () => {
    expect([...ROLES]).toEqual([
      "RETAIL",
      "CRYPTO",
      "FREELANCER",
      "SMB_OWNER",
      "SMB_FINANCE",
      "SMB_VIEWER",
      "ADMIN",
      "COMPLIANCE",
      "SUPPORT",
      "RISK",
    ]);
    expect(parseRole("CUSTOMER")).toBe("RETAIL");
    expect(parseRole("SmbOwner")).toBe("SMB_OWNER");
    expect(parseRole("SmbFinance")).toBe("SMB_FINANCE");
    expect(parseRole("SmbViewer")).toBe("SMB_VIEWER");
    expect(roleLabel("RETAIL")).toBe("Retail");
    expect(isStaffRole("RISK")).toBe(true);
    expect(isCustomerRole("FREELANCER")).toBe(true);
    expect(isStaffRole("RETAIL")).toBe(false);
  });

  it("keeps Support from freezing alone and lets them escalate", () => {
    expect(can("SUPPORT", "user.freeze")).toBe(false);
    expect(can("SUPPORT", "user.freeze.escalate")).toBe(true);
    expect(can("SUPPORT", "kyc.decide")).toBe(false);
    expect(can("SUPPORT", "staff.console")).toBe(true);
  });

  it("lets Compliance and Admin approve KYC and freeze", () => {
    expect(can("COMPLIANCE", "kyc.decide")).toBe(true);
    expect(can("ADMIN", "kyc.decide")).toBe(true);
    expect(can("COMPLIANCE", "user.freeze")).toBe(true);
    expect(can("ADMIN", "user.freeze")).toBe(true);
    expect(can("RISK", "user.freeze")).toBe(false);
    expect(can("RISK", "kyc.decide")).toBe(false);
  });

  it("gives Risk holds and velocity, not freeze", () => {
    expect(can("RISK", "risk.hold")).toBe(true);
    expect(can("RISK", "risk.velocity")).toBe(true);
    expect(can("ADMIN", "risk.hold")).toBe(true);
    expect(can("SUPPORT", "risk.hold")).toBe(false);
  });

  it("gates crypto deposit/exchange to Crypto role or Retail+flag", () => {
    expect(actorCan({ role: "CRYPTO" }, "crypto.deposit")).toBe(true);
    expect(actorCan({ role: "RETAIL", cryptoFriendly: true }, "crypto.exchange")).toBe(true);
    expect(actorCan({ role: "RETAIL", cryptoFriendly: false }, "crypto.deposit")).toBe(false);
    expect(actorCan({ role: "FREELANCER" }, "crypto.deposit")).toBe(false);
    expect(actorCan({ role: "SMB_OWNER" }, "crypto.deposit")).toBe(false);
  });

  it("keeps SmbViewer read-only, Owner invites, Finance pay-in/out", () => {
    expect(can("SMB_VIEWER", "payout.create")).toBe(false);
    expect(can("SMB_VIEWER", "payin.create")).toBe(false);
    expect(can("SMB_VIEWER", "wallet.view")).toBe(true);
    expect(can("SMB_OWNER", "smb.invite")).toBe(true);
    expect(can("SMB_OWNER", "payout.create")).toBe(true);
    expect(can("SMB_FINANCE", "payout.create")).toBe(true);
    expect(can("SMB_FINANCE", "smb.invite")).toBe(false);
    expect(can("FREELANCER", "payout.create")).toBe(true);
    expect(can("FREELANCER", "crypto.deposit")).toBe(false);
    expect(parseAccountKind("BUSINESS")).toBe("BUSINESS");
  });

  it("reserves settle, partner switch, and feature flags for Admin", () => {
    const admin = capabilitiesFor("ADMIN");
    expect(admin.settle).toBe(true);
    expect(admin.rails).toBe(true);
    expect(admin.flags).toBe(true);
    expect(can("COMPLIANCE", "rails.settle")).toBe(false);
    expect(can("COMPLIANCE", "settings.flags")).toBe(false);
    expect(can("RISK", "settings.rails")).toBe(false);
  });
});
