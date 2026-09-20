# Sibtech

Canadian-licensed full-stack fintech (Sibtech Llc — Assaf Edry). The **website** is the primary product surface: marketing, customer portal, and admin console.

**Demo-complete by design; not a live bank.**

Sibtech owns UX, onboarding / KYC-AML, the multi-currency wallet, the double-entry ledger, FX spread controls, admin, and audit. Licensed partners own settlement rails, IBAN issuance, card BIN, crypto custody, and identity verification. This repo ships labeled **DEMO** stubs for those partners — never live Thunes, Terra, BaaS, or KYC vendor calls.

## Run locally

```bash
cp .env.example .env
npm install
npm run db:setup
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Architecture map: [/architecture](http://localhost:3000/architecture).

| Type | Email | Password |
|------|--------|----------|
| Retail · crypto-friendly · verified | `jordan@sibtech.demo` | `SibtechDemo!jordan` |
| Retail · KYC in review (no crypto flag) | `amira@sibtech.demo` | `SibtechDemo!amira` |
| Admin (freeze, settle, partner switch) | `admin@sibtech.demo` | `SibtechDemo!admin` |
| Compliance (KYC; cannot freeze) | `compliance@sibtech.demo` | `SibtechDemo!compliance` |
| Support (view-only; cannot freeze) | `support@sibtech.demo` | `SibtechDemo!support` |

These are published demo accounts for the local walkthrough — not production secrets. `.env` is gitignored; only `.env.example` is committed.

### Customer walkthrough

1. Log in as Jordan (retail + crypto flag).
2. Home shows KYC **Verified**, CAD/USD/EUR/GBP/USDT/BTC balances, and recent activity.
3. **Add money** — create a local, SWIFT-like, or crypto pay-in. Instructions come from the `RailsPartner` **DEMO** stub.
4. **Send** — pay a local, SWIFT-like, or crypto beneficiary. The ledger holds funds, then captures when the stub accepts.
5. Open **Wallet**, **Crypto**, **Exchange**, **Global account**, **Cards**, **Currencies** (catalog UI only), **FX**, **Profile / KYC**.

Amira is the same retail type without the crypto flag — crypto nav and USDT/BTC stay hidden.

Personal vs Business on marketing is a signup label only. Business does **not** unlock SMB invites.

### Staff walkthrough

1. **Admin** (`admin@sibtech.demo`) — freeze retail accounts, settle pending pay-ins, switch Thunes ↔ Terra stubs, decide KYC, set FX spread, reverse journal entries.
2. **Compliance** (`compliance@sibtech.demo`) — KYC queue only. Cannot freeze.
3. **Support** (`support@sibtech.demo`) — view users, ledger, rails, audit. Cannot freeze, settle, or switch partners.

## Stack

TypeScript **Next.js 16** App Router (full-stack, `src/`):

| Layer | Choice |
|--------|--------|
| UI | React 19, Tailwind CSS 4, English-first i18n dictionary |
| Auth | Signed httpOnly session cookie (`jose` + `bcryptjs`) |
| Data | Prisma 6 + SQLite (`prisma/dev.db`) for zero-infra local demo |
| Ledger | Double-entry engine + `LedgerStore` (memory for tests, Prisma for the app) |
| Rails | `RailsPartner` interface · **Thunes** and **TerraPay / Terra Rail** DEMO stubs |
| Tests | Vitest (`npm test`) — ledger, rails, FX, permissions |

No secrets are required to run the demo. Switch the stub adapter with `RAILS_PARTNER=thunes|terrapay` or Admin → Settings.

## Architecture

```
Website (marketing + /app retail + /admin staff)
        │
        ▼
Auth · KYC status · audit
        │
        ├─ Ledger (journal, holds, reversals)     ← Sibtech software
        ├─ AFIX quotes + spread bps               ← Sibtech software
        ├─ RailsPartner ── Thunes stub (default)  ← DEMO, no live vendor
        │               └─ TerraPay / Terra stub  ← DEMO, no live vendor
        └─ Later slots: IDV, card BIN, IBAN EMI, crypto custody
```

**Ledger rules:** every movement is a balanced journal entry with a correlation id. History is never mutated — reverse with a compensating entry. Holds reduce available balance until capture or release. This is a demo ledger, not production exam-grade recon.

**Partner model:** Sibtech is the Canadian principal. `RailsPartner` is the only place corridor settlement is spoken. Do not hardcode a single vendor. Default config is the Thunes stub.

See [USER-TYPES.md](./USER-TYPES.md) for the four seeded types, [PRODUCT-GOAL.md](./PRODUCT-GOAL.md) for the longer product north star, and [SIBTECH-MASTER-PLAN.md](./SIBTECH-MASTER-PLAN.md).

## License & compliance posture

- Home license: **Canada** (MSB / money services — treat as binding for Phase 1).
- Operate globally through contracted partners, not by claiming extra licenses in this repo.
- KYC statuses and tiers gate pay-in, payout, and exchange.
- Admin actions and money movement write to an append-only audit log.
- Support cannot freeze.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run db:setup` | generate Prisma client, push schema, seed demo |
| `npm run db:reset` | wipe SQLite and reseed |
| `npm test` | ledger, rails adapter, FX, money, permissions tests |
| `npm run dev` | Next.js dev server |
| `npm run build` | production build |

## What is live vs stub

| Module | Status |
|--------|--------|
| Auth, KYC status, wallet, pay-in, payout (local / SWIFT-like / crypto) | Working demo · rails labeled **DEMO** |
| Staff: Admin / Compliance / Support | Seeded · Support cannot freeze |
| Global account, card + spend crypto, FX matrix, exchange, currency catalog | Real pages; issuance/BIN/90 rails **not** integrated |
| Live Thunes / Terra / BaaS / KYC vendors | **Not built** |
| SMB multi-user invites, PWA, loyalty, analytics theatre | **Not built** |
