export const ROLES = [
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
] as const;
export type Role = (typeof ROLES)[number];

export const STAFF_ROLES = ["ADMIN", "COMPLIANCE", "SUPPORT", "RISK"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const CUSTOMER_ROLES = [
  "RETAIL",
  "CRYPTO",
  "FREELANCER",
  "SMB_OWNER",
  "SMB_FINANCE",
  "SMB_VIEWER",
] as const;
export type CustomerRole = (typeof CUSTOMER_ROLES)[number];

export const ACCOUNT_KINDS = ["PERSONAL", "BUSINESS"] as const;
export type AccountKind = (typeof ACCOUNT_KINDS)[number];

export type Capability =
  | "wallet.view"
  | "payin.create"
  | "payout.create"
  | "fx.trade"
  | "crypto.deposit"
  | "crypto.exchange"
  | "smb.invite"
  | "staff.console"
  | "kyc.decide"
  | "user.freeze"
  | "user.freeze.escalate"
  | "risk.hold"
  | "risk.velocity"
  | "rails.settle"
  | "ledger.reverse"
  | "fx.spread"
  | "settings.rails"
  | "settings.flags";

const MONEY_MOVERS: readonly Role[] = [
  "RETAIL",
  "CRYPTO",
  "FREELANCER",
  "SMB_OWNER",
  "SMB_FINANCE",
];

const CAPABILITY_ROLES: Record<Capability, readonly Role[]> = {
  "wallet.view": CUSTOMER_ROLES,
  "payin.create": MONEY_MOVERS,
  "payout.create": MONEY_MOVERS,
  "fx.trade": MONEY_MOVERS,
  "crypto.deposit": ["CRYPTO", "RETAIL"],
  "crypto.exchange": ["CRYPTO", "RETAIL"],
  "smb.invite": ["SMB_OWNER"],
  "staff.console": STAFF_ROLES,
  "kyc.decide": ["ADMIN", "COMPLIANCE"],
  "user.freeze": ["ADMIN", "COMPLIANCE"],
  "user.freeze.escalate": ["SUPPORT"],
  "risk.hold": ["RISK", "ADMIN"],
  "risk.velocity": ["RISK", "ADMIN"],
  "rails.settle": ["ADMIN"],
  "ledger.reverse": ["ADMIN"],
  "fx.spread": ["ADMIN"],
  "settings.rails": ["ADMIN"],
  "settings.flags": ["ADMIN"],
};

const ROLE_ALIASES: Record<string, Role> = {
  CUSTOMER: "RETAIL",
  RETAIL: "RETAIL",
  CRYPTO: "CRYPTO",
  FREELANCER: "FREELANCER",
  SMBOWNER: "SMB_OWNER",
  SMB_OWNER: "SMB_OWNER",
  "SMB-OWNER": "SMB_OWNER",
  SMBFINANCE: "SMB_FINANCE",
  SMB_FINANCE: "SMB_FINANCE",
  SMBVIEWER: "SMB_VIEWER",
  SMB_VIEWER: "SMB_VIEWER",
  ADMIN: "ADMIN",
  COMPLIANCE: "COMPLIANCE",
  SUPPORT: "SUPPORT",
  RISK: "RISK",
};

export type Actor = {
  role: string;
  cryptoFriendly?: boolean;
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function isStaffRole(role: string): role is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(parseRole(role));
}

export function isCustomerRole(role: string): role is CustomerRole {
  return (CUSTOMER_ROLES as readonly string[]).includes(parseRole(role));
}

export function parseRole(value: unknown): Role {
  const key = String(value ?? "")
    .trim()
    .replace(/[\s-]/g, "_")
    .toUpperCase();
  return ROLE_ALIASES[key] ?? "RETAIL";
}

export function parseAccountKind(value: unknown): AccountKind {
  return value === "BUSINESS" ? "BUSINESS" : "PERSONAL";
}

export function can(role: string, capability: Capability, ctx?: { cryptoFriendly?: boolean }): boolean {
  const parsed = parseRole(role);
  if (capability === "crypto.deposit" || capability === "crypto.exchange") {
    if (parsed === "CRYPTO") return true;
    return parsed === "RETAIL" && Boolean(ctx?.cryptoFriendly);
  }
  return CAPABILITY_ROLES[capability].includes(parsed);
}

export function actorCan(actor: Actor, capability: Capability): boolean {
  return can(actor.role, capability, { cryptoFriendly: actor.cryptoFriendly });
}

export function capabilitiesFor(role: string, ctx?: { cryptoFriendly?: boolean }) {
  return {
    console: can(role, "staff.console"),
    kyc: can(role, "kyc.decide"),
    freeze: can(role, "user.freeze"),
    escalate: can(role, "user.freeze.escalate"),
    settle: can(role, "rails.settle"),
    reverse: can(role, "ledger.reverse"),
    spread: can(role, "fx.spread"),
    rails: can(role, "settings.rails"),
    flags: can(role, "settings.flags"),
    risk: can(role, "risk.hold") || can(role, "risk.velocity"),
    payin: can(role, "payin.create"),
    payout: can(role, "payout.create"),
    crypto: can(role, "crypto.deposit", ctx),
    invite: can(role, "smb.invite"),
    viewOnly: can(role, "wallet.view") && !can(role, "payout.create"),
  };
}

export function roleLabel(role: string): string {
  switch (parseRole(role)) {
    case "CRYPTO":
      return "Crypto";
    case "FREELANCER":
      return "Freelancer";
    case "SMB_OWNER":
      return "SMB Owner";
    case "SMB_FINANCE":
      return "SMB Finance";
    case "SMB_VIEWER":
      return "SMB Viewer";
    case "ADMIN":
      return "Admin";
    case "COMPLIANCE":
      return "Compliance";
    case "SUPPORT":
      return "Support";
    case "RISK":
      return "Risk";
    default:
      return "Retail";
  }
}

export const DEMO_SCOPE = {
  headline: "Demo-complete by design; not a live bank.",
  roles: [
    "Retail verified + KYC-in-review (must seed)",
    "Admin — settle, partner switch, feature flags, freeze, KYC",
    "Compliance — KYC + freeze; Support escalates freeze and never freezes alone",
    "Risk holds/velocity (enum + gate; UI stub, not a must-seed)",
    "Crypto role or Retail+crypto flag for crypto deposit/exchange",
    "SMB Owner invites (DEMO); Finance pay-in/out; Viewer read-only",
  ],
  outOfScope: [
    "Live Thunes / Terra / BaaS / KYC vendor calls",
    "Production exam-grade ledger recon",
    "Full SMB Finance/Viewer seats + Risk ops UI beyond a stub",
    "Mobile / PWA / loyalty / analytics theatre",
    "Ninety live currency rails (catalog UI only)",
  ],
} as const;
