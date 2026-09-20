export const ROLES = ["CUSTOMER", "ADMIN", "COMPLIANCE", "SUPPORT"] as const;
export type Role = (typeof ROLES)[number];

export const STAFF_ROLES = ["ADMIN", "COMPLIANCE", "SUPPORT"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const ACCOUNT_KINDS = ["PERSONAL", "BUSINESS"] as const;
export type AccountKind = (typeof ACCOUNT_KINDS)[number];

export type Capability =
  | "staff.console"
  | "kyc.decide"
  | "user.freeze"
  | "rails.settle"
  | "ledger.reverse"
  | "fx.spread"
  | "settings.rails";

const CAPABILITY_ROLES: Record<Capability, readonly Role[]> = {
  "staff.console": STAFF_ROLES,
  "kyc.decide": ["ADMIN", "COMPLIANCE"],
  "user.freeze": ["ADMIN"],
  "rails.settle": ["ADMIN"],
  "ledger.reverse": ["ADMIN"],
  "fx.spread": ["ADMIN"],
  "settings.rails": ["ADMIN"],
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function isStaffRole(role: string): role is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

export function parseRole(value: unknown): Role {
  return isRole(String(value)) ? (value as Role) : "CUSTOMER";
}

export function parseAccountKind(value: unknown): AccountKind {
  return value === "BUSINESS" ? "BUSINESS" : "PERSONAL";
}

export function can(role: string, capability: Capability): boolean {
  return CAPABILITY_ROLES[capability].includes(parseRole(role));
}

export function capabilitiesFor(role: string) {
  return {
    console: can(role, "staff.console"),
    kyc: can(role, "kyc.decide"),
    freeze: can(role, "user.freeze"),
    settle: can(role, "rails.settle"),
    reverse: can(role, "ledger.reverse"),
    spread: can(role, "fx.spread"),
    rails: can(role, "settings.rails"),
  };
}

export function roleLabel(role: string): string {
  switch (parseRole(role)) {
    case "ADMIN":
      return "Admin";
    case "COMPLIANCE":
      return "Compliance";
    case "SUPPORT":
      return "Support";
    default:
      return "Retail";
  }
}

export const DEMO_SCOPE = {
  headline: "Demo-complete by design; not a live bank.",
  roles: [
    "Retail (CUSTOMER) with optional crypto-friendly flag",
    "Admin — freeze, settle, partner switch, KYC, FX, reverse",
    "Compliance — KYC decisions; cannot freeze",
    "Support — view-only staff console; cannot freeze",
  ],
  outOfScope: [
    "Live Thunes / Terra / BaaS / KYC vendor calls",
    "Production exam-grade ledger recon",
    "SMB multi-user invites",
    "Risk / Freelancer / SMB Owner-Finance-Viewer matrix",
    "Mobile / PWA / loyalty / analytics theatre",
    "Ninety live currency rails (catalog UI only)",
  ],
} as const;
