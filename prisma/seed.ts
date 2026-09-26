import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { LedgerService } from "../src/lib/ledger/service";
import { PrismaLedgerStore } from "../src/lib/ledger/prisma-store";
import {
  customerWalletCode,
  partnerNostroCode,
} from "../src/lib/ledger/types";
import { WALLET_DEFAULTS } from "../src/lib/currencies";

const prisma = new PrismaClient();

function env(name: string, fallback: string) {
  return process.env[name] || fallback;
}

async function ensureBooks(
  ledger: LedgerService,
  userId: string,
  name: string,
  partner: string,
) {
  for (const currency of WALLET_DEFAULTS) {
    await ledger.ensureAccount({
      code: partnerNostroCode(partner, currency),
      name: `${partner} nostro ${currency}`,
      type: "ASSET",
      currency,
    });
    await ledger.ensureAccount({
      code: `asset:safeguarding:${currency}`,
      name: `Safeguarding ${currency}`,
      type: "ASSET",
      currency,
    });
    await ledger.ensureAccount({
      code: `revenue:fx-spread:${currency}`,
      name: `FX spread ${currency}`,
      type: "REVENUE",
      currency,
    });
    await ledger.ensureAccount({
      code: customerWalletCode(userId, currency),
      name: `${name} ${currency}`,
      type: "LIABILITY",
      currency,
      ownerUserId: userId,
    });
  }
}

async function main() {
  const partner = (process.env.RAILS_PARTNER === "terrapay" ? "terrapay" : "thunes") as
    | "thunes"
    | "terrapay";

  await prisma.auditLog.deleteMany();
  await prisma.fxQuote.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.hold.deleteMany();
  await prisma.journalLine.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.ledgerAccount.deleteMany();
  await prisma.card.deleteMany();
  await prisma.globalAccount.deleteMany();
  await prisma.beneficiary.deleteMany();
  await prisma.kycProfile.deleteMany();
  await prisma.teamInvite.deleteMany();
  await prisma.fxSpread.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  const customerEmail = env("DEMO_CUSTOMER_EMAIL", "jordan@sibtech.demo");
  const pendingEmail = env("DEMO_PENDING_EMAIL", "amira@sibtech.demo");
  const adminEmail = env("DEMO_ADMIN_EMAIL", "admin@sibtech.demo");
  const complianceEmail = env("DEMO_COMPLIANCE_EMAIL", "compliance@sibtech.demo");
  const supportEmail = env("DEMO_SUPPORT_EMAIL", "support@sibtech.demo");
  const cryptoEmail = env("DEMO_CRYPTO_EMAIL", "kai@sibtech.demo");
  const freelancerEmail = env("DEMO_FREELANCER_EMAIL", "freya@sibtech.demo");
  const smbOwnerEmail = env("DEMO_SMB_OWNER_EMAIL", "omar@sibtech.demo");

  const [jordan, amira, admin, compliance, support, kai, freya, omar] = await Promise.all([
    prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await hashPassword(env("DEMO_CUSTOMER_PASSWORD", "SibtechDemo!jordan")),
        name: "Jordan Ellison",
        role: "RETAIL",
        kycStatus: "APPROVED",
        kycTier: 2,
        country: "CA",
        phone: "+1 416 555 0148",
        cryptoFriendly: true,
        accountKind: "PERSONAL",
      },
    }),
    prisma.user.create({
      data: {
        email: pendingEmail,
        passwordHash: await hashPassword(env("DEMO_PENDING_PASSWORD", "SibtechDemo!amira")),
        name: "Amira Haddad",
        role: "RETAIL",
        kycStatus: "IN_REVIEW",
        kycTier: 0,
        country: "CA",
        phone: "+1 604 555 0190",
        cryptoFriendly: false,
        accountKind: "PERSONAL",
      },
    }),
    prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await hashPassword(env("DEMO_ADMIN_PASSWORD", "SibtechDemo!admin")),
        name: "Alex Rivera",
        role: "ADMIN",
        kycStatus: "APPROVED",
        kycTier: 2,
        country: "CA",
        accountKind: "PERSONAL",
      },
    }),
    prisma.user.create({
      data: {
        email: complianceEmail,
        passwordHash: await hashPassword(env("DEMO_COMPLIANCE_PASSWORD", "SibtechDemo!compliance")),
        name: "Maya Chen",
        role: "COMPLIANCE",
        kycStatus: "APPROVED",
        kycTier: 2,
        country: "CA",
        accountKind: "PERSONAL",
      },
    }),
    prisma.user.create({
      data: {
        email: supportEmail,
        passwordHash: await hashPassword(env("DEMO_SUPPORT_PASSWORD", "SibtechDemo!support")),
        name: "Sam Okonkwo",
        role: "SUPPORT",
        kycStatus: "APPROVED",
        kycTier: 2,
        country: "CA",
        accountKind: "PERSONAL",
      },
    }),
    prisma.user.create({
      data: {
        email: cryptoEmail,
        passwordHash: await hashPassword(env("DEMO_CRYPTO_PASSWORD", "SibtechDemo!kai")),
        name: "Kai Nakamura",
        role: "CRYPTO",
        kycStatus: "APPROVED",
        kycTier: 2,
        country: "CA",
        cryptoFriendly: true,
        accountKind: "PERSONAL",
      },
    }),
    prisma.user.create({
      data: {
        email: freelancerEmail,
        passwordHash: await hashPassword(env("DEMO_FREELANCER_PASSWORD", "SibtechDemo!freya")),
        name: "Freya Lindqvist",
        role: "FREELANCER",
        kycStatus: "APPROVED",
        kycTier: 2,
        country: "CA",
        cryptoFriendly: false,
        accountKind: "PERSONAL",
      },
    }),
    prisma.user.create({
      data: {
        email: smbOwnerEmail,
        passwordHash: await hashPassword(env("DEMO_SMB_OWNER_PASSWORD", "SibtechDemo!omar")),
        name: "Omar Rahman",
        role: "SMB_OWNER",
        kycStatus: "APPROVED",
        kycTier: 2,
        country: "CA",
        cryptoFriendly: false,
        accountKind: "BUSINESS",
      },
    }),
  ]);

  await prisma.kycProfile.create({
    data: {
      userId: jordan.id,
      legalName: "Jordan Ellison",
      dateOfBirth: "1991-04-12",
      addressLine1: "88 King Street West",
      city: "Toronto",
      region: "ON",
      postalCode: "M5V 1J2",
      country: "CA",
      occupation: "Product lead",
      sourceOfFunds: "Salary and savings",
      submittedAt: new Date("2026-03-02"),
      reviewedAt: new Date("2026-03-03"),
      reviewedById: admin.id,
    },
  });

  await prisma.kycProfile.create({
    data: {
      userId: amira.id,
      legalName: "Amira Haddad",
      dateOfBirth: "1988-11-03",
      addressLine1: "210 Cordova Street",
      city: "Vancouver",
      region: "BC",
      postalCode: "V6B 1E2",
      country: "CA",
      occupation: "Consultant",
      sourceOfFunds: "Contract income",
      submittedAt: new Date(),
      notes: "Awaiting government ID back-side.",
    },
  });

  await prisma.kycProfile.createMany({
    data: [
      {
        userId: kai.id,
        legalName: "Kai Nakamura",
        dateOfBirth: "1994-07-21",
        addressLine1: "12 Harbour Street",
        city: "Toronto",
        region: "ON",
        postalCode: "M5J 2N5",
        country: "CA",
        occupation: "Trader",
        sourceOfFunds: "Digital assets",
        submittedAt: new Date("2026-04-01"),
        reviewedAt: new Date("2026-04-02"),
        reviewedById: compliance.id,
      },
      {
        userId: freya.id,
        legalName: "Freya Lindqvist",
        dateOfBirth: "1990-02-18",
        addressLine1: "44 Queen Street",
        city: "Montreal",
        region: "QC",
        postalCode: "H3B 1A7",
        country: "CA",
        occupation: "Independent designer",
        sourceOfFunds: "Client invoices",
        submittedAt: new Date("2026-04-04"),
        reviewedAt: new Date("2026-04-05"),
        reviewedById: admin.id,
      },
      {
        userId: omar.id,
        legalName: "Omar Rahman",
        dateOfBirth: "1985-09-09",
        addressLine1: "900 West Georgia",
        city: "Vancouver",
        region: "BC",
        postalCode: "V6C 2W6",
        country: "CA",
        occupation: "Company director",
        sourceOfFunds: "Operating revenue",
        submittedAt: new Date("2026-04-06"),
        reviewedAt: new Date("2026-04-07"),
        reviewedById: admin.id,
      },
    ],
  });

  const ledger = new LedgerService(new PrismaLedgerStore());
  await ensureBooks(ledger, jordan.id, jordan.name, partner);
  await ensureBooks(ledger, amira.id, amira.name, partner);
  await ensureBooks(ledger, kai.id, kai.name, partner);
  await ensureBooks(ledger, freya.id, freya.name, partner);
  await ensureBooks(ledger, omar.id, omar.name, partner);

  const seedBalances: Array<[string, bigint]> = [
    ["CAD", 12_450_00n],
    ["USD", 3_200_50n],
    ["EUR", 1_180_00n],
    ["GBP", 420_00n],
    ["USDT", 2_500_000_000n],
    ["BTC", 8_420_000n],
  ];

  for (const [currency, amount] of seedBalances) {
    await ledger.post({
      correlationId: `seed:${jordan.id}:${currency}`,
      type: "SEED",
      description: `Demo opening ${currency} balance`,
      createdById: admin.id,
      lines: [
        {
          accountCode: partnerNostroCode(partner, currency),
          direction: "DEBIT",
          amountMinor: amount,
          currency,
        },
        {
          accountCode: customerWalletCode(jordan.id, currency),
          direction: "CREDIT",
          amountMinor: amount,
          currency,
        },
      ],
    });
  }

  for (const extra of [
    { user: kai, currency: "CAD", amount: 2_500_00n },
    { user: kai, currency: "USDT", amount: 1_000_000_000n },
    { user: freya, currency: "CAD", amount: 3_400_00n },
    { user: omar, currency: "CAD", amount: 8_800_00n },
  ]) {
    await ledger.post({
      correlationId: `seed:${extra.user.id}:${extra.currency}`,
      type: "SEED",
      description: `Demo opening ${extra.currency} balance`,
      createdById: admin.id,
      lines: [
        {
          accountCode: partnerNostroCode(partner, extra.currency),
          direction: "DEBIT",
          amountMinor: extra.amount,
          currency: extra.currency,
        },
        {
          accountCode: customerWalletCode(extra.user.id, extra.currency),
          direction: "CREDIT",
          amountMinor: extra.amount,
          currency: extra.currency,
        },
      ],
    });
  }

  const rbc = await prisma.beneficiary.create({
    data: {
      userId: jordan.id,
      name: "Jordan Ellison — RBC",
      type: "BANK",
      currency: "CAD",
      country: "CA",
      accountNumber: "4510028841",
      bankName: "Royal Bank of Canada",
    },
  });

  const northwind = await prisma.beneficiary.create({
    data: {
      userId: jordan.id,
      name: "Northwind GmbH",
      type: "BANK",
      currency: "EUR",
      country: "DE",
      iban: "DE89 3704 0044 0532 0130 00",
      swiftBic: "COBADEFFXXX",
      bankName: "Commerzbank",
    },
  });

  const pushCard = await prisma.beneficiary.create({
    data: {
      userId: jordan.id,
      name: "Maya Chen",
      type: "PUSH2CARD",
      currency: "USD",
      country: "US",
      cardToken: "tok_thunes_demo_8821",
      cardLast4: "8821",
    },
  });

  const upi = await prisma.beneficiary.create({
    data: {
      userId: jordan.id,
      name: "Priya Sharma",
      type: "UPI",
      currency: "CAD",
      country: "IN",
      upiVpa: "priya.sharma@oksbi",
    },
  });

  const pendingPayin = await prisma.payment.create({
    data: {
      userId: jordan.id,
      direction: "PAYIN",
      method: "LOCAL",
      amountMinor: "250000",
      currency: "CAD",
      status: "PENDING",
      railsPartner: partner,
      railsRef: partner === "thunes" ? "THN-SEED-PAYIN" : "TRP-SEED-PAYIN",
      railsCorridor: "ca-local-cad",
      idempotencyKey: "seed-payin-pending",
      description: "EFT from RBC payroll",
    },
  });

  await prisma.payment.create({
    data: {
      userId: jordan.id,
      direction: "PAYOUT",
      method: "BANK",
      amountMinor: "85000",
      currency: "EUR",
      status: "SETTLED",
      railsPartner: partner,
      railsRef: partner === "thunes" ? "THN-SEED-BANK" : "TRP-SEED-BANK",
      railsCorridor: "bank-eur",
      idempotencyKey: "seed-bank-payout",
      beneficiaryId: northwind.id,
      description: "Bank (SWIFT-like under Bank) to Northwind GmbH",
    },
  });

  await prisma.payment.create({
    data: {
      userId: jordan.id,
      direction: "PAYOUT",
      method: "BANK",
      amountMinor: "40000",
      currency: "CAD",
      status: "SETTLED",
      railsPartner: partner,
      railsRef: partner === "thunes" ? "THN-SEED-BANK-CAD" : "TRP-SEED-BANK-CAD",
      railsCorridor: "bank-cad",
      idempotencyKey: "seed-bank-local-payout",
      beneficiaryId: rbc.id,
      description: "Bank to RBC",
    },
  });

  await prisma.payment.create({
    data: {
      userId: jordan.id,
      direction: "PAYOUT",
      method: "PUSH2CARD",
      amountMinor: "2500",
      currency: "USD",
      status: "SETTLED",
      railsPartner: "thunes",
      railsRef: "THN-SEED-P2C",
      railsCorridor: "push2card-usd",
      idempotencyKey: "seed-push2card-payout",
      beneficiaryId: pushCard.id,
      description: "Push2card DEMO to Maya Chen •••• 8821",
    },
  });

  await prisma.payment.create({
    data: {
      userId: jordan.id,
      direction: "PAYOUT",
      method: "UPI",
      amountMinor: "12000",
      currency: "CAD",
      status: "SETTLED",
      railsPartner: partner,
      railsRef: partner === "thunes" ? "THN-SEED-UPI" : "TRP-SEED-UPI",
      railsCorridor: "upi-in",
      idempotencyKey: "seed-upi-payout",
      beneficiaryId: upi.id,
      description: "UPI to priya.sharma@oksbi",
    },
  });

  await prisma.globalAccount.createMany({
    data: [
      {
        userId: jordan.id,
        currency: "EUR",
        country: "LU",
        accountNumber: "LU4455 0010 8831",
        iban: "LU44 0010 8831 2290 0000",
        bankName: "Partner EMI (DEMO stub)",
        partner: "iban-partner-tbd",
        status: "PENDING",
      },
      {
        userId: jordan.id,
        currency: "USD",
        country: "US",
        accountNumber: "8801442291",
        routing: "026009593",
        bankName: "Partner bank (DEMO stub)",
        partner: "iban-partner-tbd",
        status: "PENDING",
      },
    ],
  });

  await prisma.card.create({
    data: {
      userId: jordan.id,
      last4: "4418",
      brand: "Visa",
      kind: "VIRTUAL",
      status: "PENDING",
      spendFromCurrency: "USDT",
      cryptoSpendEnabled: true,
    },
  });

  await prisma.fxSpread.createMany({
    data: [
      { pair: "*", spreadBps: 40, active: true },
      { pair: "CAD/USD", spreadBps: 35, active: true },
      { pair: "CAD/EUR", spreadBps: 45, active: true },
      { pair: "BTC/CAD", spreadBps: 80, active: true },
      { pair: "USDT/CAD", spreadBps: 25, active: true },
    ],
  });

  await prisma.setting.createMany({
    data: [
      { key: "rails.partner", value: partner },
      { key: "rails.push2card.partner", value: "thunes" },
      { key: "license.home", value: "CA" },
      { key: "compliance.officer", value: "Maya Chen" },
      { key: "feature.cards", value: "on" },
      { key: "feature.iban", value: "on" },
      { key: "feature.crypto", value: "on" },
      { key: "risk.velocity.cad.daily", value: "2500000" },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: "seed.completed",
        entityType: "System",
        entityId: "sibtech",
        payload: JSON.stringify({
          partner,
          pendingPayin: pendingPayin.id,
          roles: ["RETAIL", "ADMIN", "COMPLIANCE", "SUPPORT", "CRYPTO", "FREELANCER", "SMB_OWNER"],
        }),
      },
      {
        actorId: jordan.id,
        action: "login.demo",
        entityType: "User",
        entityId: jordan.id,
        payload: "{}",
      },
    ],
  });

  await prisma.teamInvite.create({
    data: {
      ownerUserId: omar.id,
      email: "finance@northstar.demo",
      memberRole: "SMB_FINANCE",
      status: "PENDING",
    },
  });

  console.log("Seeded Sibtech demo (not a live bank):");
  console.log(`  MUST retail verified  ${customerEmail}`);
  console.log(`  MUST retail KYC       ${pendingEmail}`);
  console.log(`  MUST admin            ${adminEmail}`);
  console.log(`  MUST compliance       ${complianceEmail}`);
  console.log(`  MUST support          ${supportEmail}`);
  console.log(`  opt  crypto           ${cryptoEmail}`);
  console.log(`  opt  freelancer       ${freelancerEmail}`);
  console.log(`  opt  smb owner        ${smbOwnerEmail}`);
  console.log(`  rails                 ${partner} DEMO stub`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
