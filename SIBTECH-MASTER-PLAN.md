# Sibtech A–Z Master Plan

**Company:** Sibtech Llc (Assaf Edry)  
**License:** Canadian financial license (MSB / money services — treat as binding for Phase 1)  
**Document status:** Execution-ready · hand to eng/design tomorrow  
**Last updated:** 2026-09-19 (Asia/Jerusalem)

---

## 1. Company thesis

Sibtech is a Canadian-licensed full-stack fintech building one product surface for fiat + crypto money movement: wallets, pay-in/payout, IBAN, cards, and crypto FX/exchange. We own the customer experience, ledger, KYC/AML workflow, and risk controls in software; we route banking rails, card issuance, and IBAN through licensed partners under our Canadian license constraints. Goal: one company, one product platform, end-to-end — not a patchwork of disconnected modules.

---

## 2. Product map

| Module | Purpose | User story | Dependencies | MVP vs later |
|--------|---------|------------|--------------|--------------|
| **Wallet** | Core balance & ledger accounts (fiat + crypto) | “As a user I see balances, history, and can move money between my accounts.” | Ledger, KYC tier, auth | **MVP (Phase 1)** |
| **Pay-in** | Accept funds into wallet (bank transfer, partner rails) | “As a user/merchant I get paid; money lands in my Sibtech wallet.” | Wallet, banking partner, webhooks, AML screening | **MVP (Phase 1)** |
| **Payout** | Send funds out (bank, partner, later crypto) | “As a user I withdraw or pay a beneficiary.” | Wallet, banking partner, beneficiary KYC/sanctions, limits | **MVP (Phase 1)** |
| **Crypto exchange / change** | Spot convert crypto↔crypto or crypto↔fiat | “As a user I swap assets at a quoted rate.” | Wallet, liquidity/partner or AFIX, travel rule, price oracle | Phase 2 |
| **Crypto FX (AFIX)** | FX / priced crypto conversion engine | “As a user/ops I get executable FX quotes with spread/controls.” | Liquidity, risk limits, ledger, pricing service | Phase 2–3 |
| **Issue Card** | Virtual/physical cards tied to wallet | “As a user I pay online/offline with a Sibtech card.” | Wallet, card BIN sponsor / issuer processor, KYC tier, 3DS | Phase 3 |
| **Issue IBAN** | Dedicated IBAN (or account number) for inbound fiat | “As a user I receive SEPA/ACH-like transfers to my own IBAN.” | Partner bank / EMI, Wallet, KYC, reconciliation | Phase 3–4 |

**Cross-cutting (all phases):** Auth, KYC/AML, ledger, admin console, audit logs, notifications, webhooks (inbound partner + outbound to merchants).

---

## 3. Recommended build order (Phases 0–4)

### Phase 0 — Foundation (pre-product)
- Legal entity ops under CA license: policies, compliance calendar, designated compliance officer checklist
- Choose stack, environments (dev/staging/prod), secrets, CI/CD
- Auth (email/phone + MFA), roles (customer / admin / compliance)
- Core **ledger** design (double-entry, multi-asset, immutable journal)
- Partner shortlist: banking rail + KYC vendor (no card/IBAN yet)

### Phase 1 — Money in/out under CA license (**Wallet + Pay-in + Payout**)
**Scope sentence:** Ship a KYC’d Canadian-compliant wallet with partner-rail pay-in and payout, full ledger, admin ops, and audit — no cards, no IBAN issuance, limited or no crypto trading yet.

- Customer web app: onboarding → KYC → wallet balances → deposit instructions → withdraw to bank
- Admin: user review, transaction hold/release, manual payouts if needed, basic risk flags
- Hard constraints from CA license: geo/customer eligibility, transaction limits by KYC tier, sanctions screening, record retention, travel-rule readiness even if crypto volume is deferred

### Phase 2 — Crypto rails
- Crypto deposit/withdraw (selected chains)
- Exchange/change + early AFIX quoting
- Travel rule implementation with VASP counterparties
- Liquidity & spread controls; ops dashboards for crypto risk

### Phase 3 — Cards
- Card issuance via BIN sponsor / processor (Sibtech = program manager UX + ledger, not card network principal unless licensed)
- Virtual cards first → physical later
- Auth (3DS), spend controls, card lifecycle in admin

### Phase 4 — IBAN + scale
- IBAN / dedicated account numbers via partner bank or EMI
- Reconciliation automation, multi-currency expansion
- Merchant APIs, webhooks v2, reporting for finance/compliance

---

## 4. Architecture sketch

```
┌─────────────────────────────────────────────────────────────┐
│  Web App                                                     │
│  ├── Customer app (onboarding, wallet, pay-in/out, later…) │
│  └── Admin console (KYC queue, txns, risk, partners)       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│  API layer (REST + webhooks)                                 │
│  Auth · rate limits · idempotency keys · audit middleware    │
└──┬──────────┬──────────┬──────────┬──────────┬──────────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
 Ledger    KYC/AML    Banking     Card       Crypto
 service   service    partners    partners   rails
 (journal,  (vendor +  (pay-in/   (Phase 3)  (Phase 2:
  balances,  Sibtech    payout,              custodial/
  holds)     decision)  Phase 1)             exchange,
                                             AFIX)
   │
   ▼
 Webhooks: partner → Sibtech (settlement, KYC status)
           Sibtech → merchant (payment events) [later]
```

**Ledger rules (non-negotiable):**
- Double-entry; every movement is a journal entry with correlation IDs
- Holds/pending before settlement; never mutate history — reverse with compensating entries
- Multi-asset accounts (CAD first; USD/EUR/crypto account types ready)

**API principles:** Idempotent payouts; signed webhooks; structured error codes; admin actions fully audited.

---

## 5. Compliance & ops (Canada-centric)

| Area | What Sibtech owns in software | Needs licensed / regulated partner |
|------|-------------------------------|-------------------------------------|
| **KYC/AML** | Onboarding UX, risk scoring UI, case management, SAR/STR workflow stubs, retention | Identity vendor (IDV), sanctions/PEP lists; file reports per FINTRAC / provincial obligations as applicable |
| **Travel rule (crypto)** | Originator/beneficiary data capture, counterparty VASP messaging hooks, blocking incomplete data | Travel-rule network / VASP partners when moving crypto |
| **Card issuance** | Card UX, spend limits, freeze/replace, statement in-app | BIN sponsor / issuer processor / network membership |
| **IBAN** | Display IBAN, reconcile inbound, map to wallet | Partner bank / EMI that issues account numbers |
| **Pay-in / Payout rails** | Instructions UI, beneficiary book, limits engine | Banking/payment partner under CA corridor |
| **Risk controls** | Velocity limits, device signals, manual hold queue, list management | External fraud intel optional |
| **Audit logs** | Immutable admin + API action log, export for exams | — (software-owned) |

**Ops baseline:**
- Compliance officer + escalation path documented
- Daily reconciliation: partner statements ↔ ledger
- Transaction monitoring rules (amount, velocity, geography, peer patterns)
- Customer support playbooks for frozen funds / KYC retry
- Data residency / retention aligned to Canadian requirements (define retention schedule in Phase 0)

---

## 6. Brand & app information architecture

### Customer app — main nav
1. **Home** — balances, recent activity, KYC status banner  
2. **Wallet** — accounts, statements, export  
3. **Add money** (Pay-in) — methods, instructions, pending deposits  
4. **Send** (Payout) — beneficiaries, amount, review, receipt  
5. **Exchange** *(Phase 2)* — quote → confirm → history  
6. **Cards** *(Phase 3)* — list, details, controls  
7. **IBAN / Account details** *(Phase 4)* — receive details, share  
8. **Profile** — identity, security (MFA), limits, documents, support  

### Admin console — main nav
1. **Dashboard** — volumes, fails, KYC backlog, risk alerts  
2. **Users** — search, KYC tier, freeze/unfreeze  
3. **KYC / Cases** — queue, docs, decision, notes  
4. **Transactions** — ledger search, hold/release, reverse  
5. **Payouts / Pay-ins** — partner status, retries, reconciliation  
6. **Crypto** *(Phase 2)* — wallets, travel-rule queue, liquidity  
7. **Cards / IBAN** *(Phase 3–4)* — programs, inventory, incidents  
8. **Risk & Lists** — rules, sanctions hits, velocity  
9. **Audit & Reports** — export, compliance packs  
10. **Settings** — partners, feature flags, limits by tier  

**Brand note for designers:** Clean fintech; trust-first (Canada license badge in footer/settings); Hebrew + English UI later — ship English-first for Phase 1; keep copy short for Israeli founder review.

---

## 7. 90-day delivery plan (week-by-week, high level)

Assumes small core team (founder + eng + design + compliance advisor). Adjust dates to calendar start; weeks are sequential from kickoff.

| Week | Focus |
|------|--------|
| **1** | Kickoff; license constraints memo; stack & repo; ledger schema draft; KYC vendor + banking partner RFI |
| **2** | Auth + roles; environment pipeline; threat model lite; compliance policy stubs (AML program outline) |
| **3** | Ledger MVP (accounts, journal, holds); admin shell; customer shell (IA from §6) |
| **4** | KYC integration (happy path + reject/retry); tier limits config |
| **5** | Wallet UI + API; balance/history; notifications (email) |
| **6** | Pay-in: partner sandbox, deposit instructions, inbound webhook → credit ledger |
| **7** | Payout: beneficiaries, sanctions check, idempotent send, status webhooks |
| **8** | Risk rules v1 (limits, velocity); admin hold/release; reconciliation report v0 |
| **9** | Hardening: audit log completeness, idempotency tests, staging E2E |
| **10** | UAT with internal users; fix critical bugs; support playbooks |
| **11** | Partner prod credentials; limited beta (invite-only CA-eligible users) |
| **12** | Beta ops; metrics; Phase 2 crypto spike (chain + custody choice); Phase 1 freeze checklist |
| **13** | Buffer / launch readiness: exam pack (policies + sample audit export); roadmap lock for Phase 2 |

**Exit criteria Phase 1:** Real KYC’d user can fund wallet via partner pay-in and payout to a verified bank beneficiary with full ledger + admin visibility + audit trail.

---

## 8. Open decisions (blockers only — max 8)

1. **Exact Canadian license scope** — Which activities are in-scope today (e.g. MSB dealing in virtual currency, money transmission) vs require additional registration/partner? *Blocks crypto Phase 2 and marketing claims.*
2. **Primary banking / payment partner** for CAD (and later USD) pay-in/payout — shortlist and sign sandbox. *Blocks Phase 1 weeks 6–7.*
3. **KYC/IDV vendor** (and sanctions list provider) — choose one stack. *Blocks onboarding.*
4. **Customer eligibility** — Canada-only at launch vs other geos; residency vs citizenship rules. *Blocks growth and compliance design.*
5. **Custody model for crypto (Phase 2)** — third-party qualified custodian vs partner exchange omnibus. *Blocks travel rule + liability.*
6. **Card BIN sponsor / program** (Phase 3) — which processor and who is BIN owner. *Blocks card roadmap.*
7. **IBAN partner bank / EMI** (Phase 4) — SEPA vs multi-corridor; who holds customer funds. *Blocks IBAN marketing.*
8. **Ledger currency & float policy** — client money safeguarding / segregation approach under CA rules. *Blocks finance ops and partner contracts.*

---

## Appendix — Engineering handoff checklist (tomorrow)

- [ ] Read §§2–4; confirm Phase 1 scope sentence  
- [ ] Draft OpenAPI stubs: Wallet, Pay-in, Payout, KYC webhook  
- [ ] Design Figma: customer Home / Wallet / Add money / Send + admin KYC queue  
- [ ] Founder: schedule partner RFIs for decisions #2 and #3  
- [ ] Compliance: license scope memo (#1) before any public crypto/card claims  

---

*End of Sibtech A–Z Master Plan*
