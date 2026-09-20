# Sibtech

Canadian-licensed full-stack fintech (Sibtech Llc — Assaf Edry). The **website** is the primary product surface: marketing, customer portal, and admin console.

Sibtech owns UX, onboarding / KYC-AML, the multi-currency wallet, the double-entry ledger, FX spread controls, admin, and audit. Licensed partners own settlement rails, IBAN issuance, card BIN, crypto custody, and identity verification.

## Run locally

```bash
cp .env.example .env
npm install
npm run db:setup
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Role | Email | Password |
|------|--------|----------|
| Verified customer | `jordan@sibtech.demo` | `SibtechDemo!jordan` |
| KYC in review | `amira@sibtech.demo` | `SibtechDemo!amira` |
| Admin / compliance | `admin@sibtech.demo` | `SibtechDemo!admin` |

These are published demo accounts for the local walkthrough — not production secrets. `.env` is gitignored; only `.env.example` is committed.

### Customer walkthrough

1. Log in as Jordan.
2. Home shows KYC **Verified**, CAD/USD/EUR/GBP/USDT/BTC balances, and recent activity.
3. **Add money** — create a local, SWIFT, or crypto pay-in. Instructions come from the `RailsPartner` stub.
4. **Send** — pay a local, SWIFT/cross-border, or crypto beneficiary. The ledger holds funds, then captures when the stub accepts.
5. Open **Wallet**, **Exchange**, **Global account**, **Cards**, **Currencies**, **FX & spread**, **Profile / KYC**. Every product module is in the nav.

### Admin walkthrough

1. Log in as `admin@sibtech.demo`.
2. Dashboard: volumes, KYC backlog, pending pay-ins, active rail adapter.
3. **KYC / Cases** — approve Amira (or reject with a note).
4. **Pay-ins / Payouts** — settle Jordan’s pending pay-in (simulates the partner webhook and credits the ledger).
5. **Transactions** — inspect the immutable journal; reverse with a compensating entry.
6. **FX controls** — change spread bps. **Settings** — switch Thunes ↔ TerraPay/Terra Rail.

## Stack

TypeScript **Next.js 16** App Router (full-stack, `src/`):

| Layer | Choice |
|--------|--------|
| UI | React 19, Tailwind CSS 4, English-first i18n dictionary |
| Auth | Signed httpOnly session cookie (`jose` + `bcryptjs`) |
| Data | Prisma 6 + SQLite (`prisma/dev.db`) for zero-infra local demo |
| Ledger | Double-entry engine + `LedgerStore` (memory for tests, Prisma for the app) |
| Rails | `RailsPartner` interface · **Thunes** and **TerraPay / Terra Rail** stubs |
| Tests | Vitest (`npm test`) |

No secrets are required to run the demo. Switch the live adapter with `RAILS_PARTNER=thunes|terrapay` or Admin → Settings.

## Architecture

```
Website (marketing + /app customer + /admin)
        │
        ▼
Auth · KYC tiers · audit middleware
        │
        ├─ Ledger (journal, holds, reversals, multi-asset)
        ├─ RailsPartner ── Thunes stub (default)
        │               └─ TerraPay / Terra Rail stub
        ├─ AFIX quotes (mid book + configurable spread)
        └─ Later partner slots: IDV, card BIN, IBAN EMI, crypto custody
```

**Ledger rules:** every movement is a balanced journal entry with a correlation id. History is never mutated — reverse with a compensating entry. Holds reduce available balance until capture or release.

**Partner model:** Sibtech is the Canadian principal. `RailsPartner` is the only place corridor settlement is spoken. Do not hardcode a single vendor. Default config is the Thunes stub so Phase 1 can ship while the founder picks Thunes or TerraPay for production.

## License & compliance posture

- Home license: **Canada** (MSB / money services — treat as binding for Phase 1).
- Operate globally through contracted partners, not by claiming extra licenses in this repo.
- KYC statuses and tiers gate pay-in, payout, and exchange.
- Admin actions and money movement write to an append-only audit log.

See [PRODUCT-GOAL.md](./PRODUCT-GOAL.md) and [SIBTECH-MASTER-PLAN.md](./SIBTECH-MASTER-PLAN.md).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run db:setup` | generate Prisma client, push schema, seed demo |
| `npm run db:reset` | wipe SQLite and reseed |
| `npm test` | ledger, rails adapter, FX, money tests |
| `npm run dev` | Next.js dev server |
| `npm run build` | production build |

## What is live vs stub

| Module | Status |
|--------|--------|
| Auth, KYC status, wallet, pay-in, payout (local / SWIFT / crypto) | Working Phase 1 demo |
| Admin: users, KYC queue, journal, rails queue, FX spread, audit | Working |
| Global account, card + spend crypto, FX matrix, exchange, 90-currency catalog | Real pages on the ledger/quote engine; issuance/BIN still partner-pending |
