# User types — permission matrix

**Demo-complete by design; not a live bank.**

All **10 roles** are enums with capability gates in `src/lib/auth/permissions.ts`. The Musk-cut seed shows five must-logins plus three optional cheap accounts. Full SMB Finance/Viewer seats and a full Risk ops console are post-demo.

## Matrix (source of truth)

| Role | Money | Crypto deposit/exchange | Staff |
|------|--------|--------------------------|--------|
| **Retail** | Wallet, pay-in, Bank/Push2card/UPI payout, FX | Only with `cryptoFriendly` flag | — |
| **Crypto** | Same as Retail | Yes | — |
| **Freelancer** | Same as Retail | No | — |
| **SmbOwner** | Pay-in/out + **invites** (DEMO TeamInvite) | No | — |
| **SmbFinance** | Pay-in/out | No | — |
| **SmbViewer** | **Read-only** wallet | No | — |
| **Admin** | — | — | KYC, freeze, settle, partner switch, **feature flags**, holds |
| **Compliance** | — | — | **KYC + freeze** |
| **Support** | — | — | Console view. **Never freezes alone** — escalate |
| **Risk** | — | — | **Holds + velocity** (not freeze). UI stub; not a must-seed |

Payout corridors stay **Bank | Push2card | UPI**. SWIFT sits under Bank.

## Must-seed (login)

| Person | Email | Role | Notes |
|--------|--------|------|--------|
| Jordan Ellison | `jordan@sibtech.demo` | Retail | Verified, crypto flag on, funded wallets |
| Amira Haddad | `amira@sibtech.demo` | Retail | KYC in review, crypto off |
| Alex Rivera | `admin@sibtech.demo` | Admin | Settle, partner switch, flags, freeze, KYC |
| Maya Chen | `compliance@sibtech.demo` | Compliance | KYC + freeze |
| Sam Okonkwo | `support@sibtech.demo` | Support | Escalate freeze only |

## Optional seed

| Person | Email | Role |
|--------|--------|------|
| Kai Nakamura | `kai@sibtech.demo` | Crypto |
| Freya Lindqvist | `freya@sibtech.demo` | Freelancer |
| Omar Rahman | `omar@sibtech.demo` | SMB Owner (DEMO invite) |

SmbFinance / SmbViewer logins and a Risk user are **not** seeded. Gates exist in code.

## Explicitly not in this demo

- Live Thunes / Terra / BaaS / KYC vendor calls
- Production exam-grade ledger recon
- Full SMB Finance/Viewer seats + Risk ops beyond the stub
- Mobile / PWA / loyalty / analytics theatre
- ~90 live currency rails (catalog UI only)
