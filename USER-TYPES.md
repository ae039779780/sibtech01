# User types — demo scope

**Demo-complete by design; not a live bank.**

This walkthrough ships **four** seeded types. Everything else in a fuller staff or SMB matrix is out of scope for this demo.

## Retail (`CUSTOMER`)

- Personal or Business signup **label** (Business is single-user — no SMB invites).
- Optional **crypto-friendly** flag (Jordan: on · Amira: off).
- Surfaces: wallet, KYC status, global account, pay-in, payout (incl. SWIFT-like stub), FX, cards UI, crypto screens when the flag is on.

Seeded:

| Person | Email | Notes |
|--------|--------|--------|
| Jordan Ellison | `jordan@sibtech.demo` | Verified, crypto on, funded wallets |
| Amira Haddad | `amira@sibtech.demo` | KYC in review, crypto off |

## Admin (`ADMIN`)

Alex Rivera · `admin@sibtech.demo`

Can freeze retail accounts, settle pay-ins, switch Thunes ↔ Terra DEMO adapters, decide KYC, set FX spread, reverse journal entries.

## Compliance (`COMPLIANCE`)

Maya Chen · `compliance@sibtech.demo`

Owns the KYC queue. **Cannot freeze.**

## Support (`SUPPORT`)

Sam Okonkwo · `support@sibtech.demo`

View-only staff console (users, ledger, rails queue, audit). **Cannot freeze**, settle, switch partners, or decide KYC.

## Explicitly not in this demo

- Risk, Freelancer, SMB Owner / Finance / Viewer as first-class types
- Full SMB multi-user invites
- Live Thunes / Terra / BaaS / KYC vendor calls
- Production exam-grade ledger recon
- Mobile / PWA / loyalty / analytics theatre
- ~90 live currency rails (catalog UI only)
