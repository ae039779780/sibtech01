# Sibtech — Locked product goal

**License:** Canadian financial license  
**Primary surface:** Website (customer + admin) — base for the whole product  
**Updated:** 2026-09-20

## Demo vs north star

The Phase 1 website is **demo-complete, not a live bank**: four seeded types (Retail + crypto flag, Admin, Compliance, Support), RailsPartner Thunes/Terra **stubs**, catalog UI instead of 90 live rails. Do not wire live vendors for the architecture walkthrough.

## Must cover

1. **Website** — primary product surface (not app-only)
2. **Onboarding / KYC-AML** — under CA license rules
3. **Pay Wallet** — multi-asset balances + ledger
4. **Issue Global Account** — local/global account details via partners
5. **Pay-in globally** — local rails per corridor + crypto deposit
6. **Payout** — SWIFT + local rails + crypto
7. **Crypto-friendly** — deposit, withdraw, exchange
8. **Issue Card** — spend from wallet / crypto (partner BIN)
9. **Spend your crypto** — card + convert-at-spend / FX path
10. **FX + spread** — AFIX engine with configurable spread
11. **~90 currencies** — multi-currency wallet + FX matrix (partner liquidity)

## Software vs partner

| Own in software | Needs licensed partner |
|-----------------|------------------------|
| Website UX, onboarding, wallet, ledger, FX UI/spread controls, admin, audit | Global accounts, SWIFT, local pay rails, crypto custody/liquidity, card BIN, IDV |

## Build note

Cursor Cloud Agents blocked until Pro; repo ready: https://github.com/ae039779780/sibtech01  

## Global rails partners (locked preference)
- Primary candidates: **Thunes** or **TerraPay / Terra Rail** (user: טונס / טרה רייל)
- Role: global pay-in / payout corridors (local + cross-border), under Sibtech Canadian license + partner contracts
- Architecture: partner adapter interface; Sibtech owns wallet/ledger/UX; partner owns rails settlement
