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
  await prisma.fxSpread.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  const customerEmail = env("DEMO_CUSTOMER_EMAIL", "jordan@sibtech.demo");
  const pendingEmail = env("DEMO_PENDING_EMAIL", "amira@sibtech.demo");
  const adminEmail = env("DEMO_ADMIN_EMAIL", "admin@sibtech.demo");

  const [jordan, amira, admin] = await Promise.all([
    prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await hashPassword(env("DEMO_CUSTOMER_PASSWORD", "SibtechDemo!jordan")),
        name: "Jordan Ellison",
        role: "CUSTOMER",
        kycStatus: "APPROVED",
        kycTier: 2,
        country: "CA",
        phone: "+1 416 555 0148",
      },
    }),
    prisma.user.create({
      data: {
        email: pendingEmail,
        passwordHash: await hashPassword(env("DEMO_PENDING_PASSWORD", "SibtechDemo!amira")),
        name: "Amira Haddad",
        role: "CUSTOMER",
        kycStatus: "IN_REVIEW",
        kycTier: 0,
        country: "CA",
        phone: "+1 604 555 0190",
      },
    }),
    prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await hashPassword(env("DEMO_ADMIN_PASSWORD", "SibtechDemo!admin")),
        name: "Sibtech Compliance",
        role: "ADMIN",
        kycStatus: "APPROVED",
        kycTier: 2,
        country: "CA",
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

  const ledger = new LedgerService(new PrismaLedgerStore());
  await ensureBooks(ledger, jordan.id, jordan.name, partner);
  await ensureBooks(ledger, amira.id, amira.name, partner);

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

  const rbc = await prisma.beneficiary.create({
    data: {
      userId: jordan.id,
      name: "Jordan Ellison — RBC",
      type: "LOCAL",
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
      type: "SWIFT",
      currency: "EUR",
      country: "DE",
      iban: "DE89 3704 0044 0532 0130 00",
      swiftBic: "COBADEFFXXX",
      bankName: "Commerzbank",
    },
  });

  await prisma.beneficiary.create({
    data: {
      userId: jordan.id,
      name: "Self-custody USDT",
      type: "CRYPTO",
      currency: "USDT",
      country: "XX",
      cryptoNetwork: "TRON",
      cryptoAddress: "TXY9demoSelfCustody111111111111",
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
      method: "SWIFT",
      amountMinor: "85000",
      currency: "EUR",
      status: "SETTLED",
      railsPartner: partner,
      railsRef: partner === "thunes" ? "THN-SEED-SWIFT" : "TRP-SEED-SWIFT",
      railsCorridor: "swift-eur",
      idempotencyKey: "seed-swift-payout",
      beneficiaryId: northwind.id,
      description: "SWIFT to Northwind GmbH",
    },
  });

  await prisma.payment.create({
    data: {
      userId: jordan.id,
      direction: "PAYOUT",
      method: "LOCAL",
      amountMinor: "40000",
      currency: "CAD",
      status: "SETTLED",
      railsPartner: partner,
      railsRef: partner === "thunes" ? "THN-SEED-LOCAL" : "TRP-SEED-LOCAL",
      railsCorridor: "ca-local-cad",
      idempotencyKey: "seed-local-payout",
      beneficiaryId: rbc.id,
      description: "EFT to RBC",
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
        bankName: "Partner EMI (sandbox)",
        partner: "iban-partner-tbd",
        status: "PENDING",
      },
      {
        userId: jordan.id,
        currency: "USD",
        country: "US",
        accountNumber: "8801442291",
        routing: "026009593",
        bankName: "Partner bank (sandbox)",
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
      { key: "license.home", value: "CA" },
      { key: "compliance.officer", value: "Sibtech Compliance" },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: "seed.completed",
        entityType: "System",
        entityId: "sibtech",
        payload: JSON.stringify({ partner, pendingPayin: pendingPayin.id }),
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

  console.log("Seeded Sibtech demo:");
  console.log(`  customer  ${customerEmail}`);
  console.log(`  pending   ${pendingEmail}`);
  console.log(`  admin     ${adminEmail}`);
  console.log(`  rails     ${partner} stub`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
