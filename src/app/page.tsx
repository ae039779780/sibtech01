import { LicenseBadge, Logo } from "@/components/brand";
import { Button } from "@/components/ui";

const modules = [
  ["Accounts", "CAD, USD, EUR, GBP — plus USDT/BTC when crypto-friendly."],
  ["Add money", "Local rails, SWIFT-like stub, or crypto deposit. DEMO labeled."],
  ["Send", "Pay locally or across borders on the RailsPartner stub."],
  ["Cards", "Virtual card UI. Spend-crypto is a DEMO surface."],
  ["Exchange", "AFIX quotes with a spread you control."],
  ["Global account", "Local details via partner EMI — DEMO pending."],
];

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#product">Product</a>
          <a href="/architecture">Architecture</a>
          <a href="#license">License</a>
          <a href="/login">Log in</a>
        </nav>
        <Button href="/register">Get started</Button>
      </header>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 pt-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <LicenseBadge />
          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight text-ink md:text-7xl">
            Money without borders.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-7 text-muted">
            Canadian-licensed. Global by partners. One app for wallets, pay-in,
            payout, cards, and crypto FX.
          </p>
          <p className="mt-4 max-w-md text-sm text-muted">
            <span className="mr-2 inline-flex rounded-full bg-warn/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warn">
              DEMO
            </span>
            Demo-complete by design — not a live bank. Rails are Thunes / Terra stubs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/register?kind=PERSONAL" className="h-12 px-6 text-base">
              Personal
            </Button>
            <Button href="/register?kind=BUSINESS" variant="ghost" className="h-12 px-6">
              Business
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted">
            Business is a single-user demo label — not SMB invites or a staff matrix.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <a href="/login" className="text-teal">
              Open the app
            </a>
            <span className="text-muted">·</span>
            <a href="/architecture" className="text-teal">
              Architecture
            </a>
            <span className="text-muted">·</span>
            <a href="/login?next=/admin" className="text-teal">
              Staff console
            </a>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="relative h-[560px] w-[280px] rounded-[2.6rem] border border-white/10 bg-black p-3 shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
            <div className="h-full overflow-hidden rounded-[2.1rem] bg-[#08141f] px-5 py-6">
              <p className="text-xs text-muted">Good afternoon</p>
              <p className="mt-1 text-lg font-semibold">Jordan</p>
              <p className="mt-10 text-center text-[11px] uppercase tracking-[0.2em] text-muted">
                Accounts
              </p>
              <p className="mt-2 text-center text-[2.15rem] font-semibold leading-none tracking-tight">
                CA$12,675
              </p>
              <div className="mt-8 flex justify-between px-2 text-center text-[10px]">
                {["Add", "Send", "Exchange", "Card"].map((l) => (
                  <div key={l} className="flex flex-col items-center gap-2">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[11px] font-semibold text-navy">
                      {l[0]}
                    </span>
                    {l}
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#12324f] to-[#0c6b75] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Sibtech card</p>
                <p className="mt-6 font-mono tracking-[0.25em]">•••• 4418</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <p className="text-xs uppercase tracking-[0.2em] text-teal">Product</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight">Everything in one place</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(([title, copy]) => (
            <article key={title} className="rounded-[1.4rem] bg-white/[0.04] p-6">
              <h3 className="text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm text-muted">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="license" className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.4rem] bg-white/[0.04] p-6">
            <h3 className="font-medium">Licensed in Canada</h3>
            <p className="mt-2 text-sm text-muted">
              Sibtech is the principal. Partners move the rails.
            </p>
          </article>
          <article className="rounded-[1.4rem] bg-white/[0.04] p-6">
            <h3 className="font-medium">Thunes or TerraPay</h3>
            <p className="mt-2 text-sm text-muted">
              Same ledger. Switch the DEMO adapter — never the customer book.
            </p>
          </article>
          <article className="rounded-[1.4rem] bg-white/[0.04] p-6">
            <h3 className="font-medium">Crypto-friendly</h3>
            <p className="mt-2 text-sm text-muted">
              Hold it, send it, spend it on the card — when the retail flag is on.
            </p>
          </article>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-sm text-muted">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Logo />
          <p>Sibtech Llc · Assaf Edry · Demo-complete · not a live bank</p>
        </div>
      </footer>
    </div>
  );
}
