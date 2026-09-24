"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Bank,
  CirclesThreePlus,
  CreditCard,
  CurrencyCircleDollar,
  GlobeHemisphereWest,
  ShieldCheck,
  Wallet,
} from "@phosphor-icons/react";

const products = [
  {
    title: "Wallet",
    copy: "Hold multi-currency balances with clear ledgers and instant internal moves.",
    icon: Wallet,
  },
  {
    title: "Global accounts",
    copy: "Collect in local currencies and settle into one operating view.",
    icon: GlobeHemisphereWest,
  },
  {
    title: "Pay-in & payout",
    copy: "SWIFT, local rails, and crypto corridors — routed for speed and cost.",
    icon: Bank,
  },
  {
    title: "Cards",
    copy: "Issue spend controls for teams without losing treasury visibility.",
    icon: CreditCard,
  },
  {
    title: "FX",
    copy: "Convert with transparent spreads when you move, not when you wait.",
    icon: CurrencyCircleDollar,
  },
];

const steps = [
  {
    n: "01",
    title: "Open under Canadian licensing",
    copy: "Onboard with regulated KYC/KYB and a clear compliance posture from day one.",
  },
  {
    n: "02",
    title: "Fund and collect globally",
    copy: "Stand up accounts and pay-in methods that match where your customers actually pay.",
  },
  {
    n: "03",
    title: "Pay out on the right rail",
    copy: "Choose SWIFT, local transfer, or crypto — Sibtech optimizes the path, you keep control.",
  },
];

export default function Home() {
  const reduce = useReducedMotion();
  const fade = (delay = 0) =>
    reduce
      ? undefined
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.35 },
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
        };

  return (
    <div className="flex min-h-full flex-col">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-20 sm:px-8">
          <a
            href="#top"
            className="font-[family-name:var(--font-display)] text-xl tracking-tight text-white sm:text-2xl"
          >
            Sibtech
          </a>
          <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
            <a href="#products" className="transition-colors hover:text-white">
              Products
            </a>
            <a href="#trust" className="transition-colors hover:text-white">
              Trust
            </a>
            <a href="#flow" className="transition-colors hover:text-white">
              How it works
            </a>
          </nav>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-fog"
          >
            Talk to us
            <ArrowRight weight="bold" className="h-4 w-4" />
          </a>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero — one composition, brand-first, full-bleed */}
        <section className="relative min-h-[100svh] overflow-hidden text-white">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/hero.jpg)" }}
            aria-hidden
          />
          <div className="hero-scrim absolute inset-0" aria-hidden />
          <div className="grain absolute inset-0" aria-hidden />

          <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20 lg:justify-center lg:pb-24">
            <motion.div
              className="max-w-2xl"
              initial={false}
              animate={reduce ? undefined : { opacity: [0.92, 1], y: [12, 0] }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
                Sibtech
              </p>
              <h1 className="mt-6 max-w-xl text-2xl font-medium leading-snug tracking-tight text-white/95 sm:text-3xl">
                Move money across borders with a Canadian-licensed platform.
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
                Wallet, global accounts, payouts, cards, and FX — built for
                operators who need rails that clear, not decks that promise.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-bright"
                >
                  Request access
                  <ArrowRight weight="bold" className="h-4 w-4" />
                </a>
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/12"
                >
                  See products
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Products — one job */}
        <section id="products" className="relative bg-paper px-5 py-24 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fade()}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald">
                Platform
              </p>
              <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink sm:text-5xl">
                Everything between your treasury and the world.
              </h2>
              <p className="mt-4 max-w-xl text-muted">
                One stack for collection, conversion, and payout — without
                stitching together five vendors.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.title}
                    className="border-t border-line pt-6"
                    {...fade(0.05 * i)}
                  >
                    <Icon
                      weight="duotone"
                      className="h-7 w-7 text-emerald"
                      aria-hidden
                    />
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">
                      {item.copy}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section
          id="trust"
          className="relative overflow-hidden bg-ink px-5 py-24 text-white sm:px-8 sm:py-28"
        >
          <div
            className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-emerald/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-gold/15 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <motion.div {...fade()}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-bright">
                Trust
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">
                Licensed in Canada. Built for real compliance.
              </h2>
              <p className="mt-5 max-w-xl text-white/70">
                Sibtech Llc operates under Canadian licensing expectations —
                KYC, KYB, sanctions screening, and audit-ready money movement
                for businesses that cannot afford grey-area rails.
              </p>
            </motion.div>
            <motion.ul className="space-y-5" {...fade(0.12)}>
              {[
                {
                  icon: ShieldCheck,
                  title: "Regulated posture",
                  copy: "Licensing-first design for onboarding and ongoing monitoring.",
                },
                {
                  icon: CirclesThreePlus,
                  title: "Multi-rail routing",
                  copy: "SWIFT, local, and crypto paths selected for corridor fit.",
                },
                {
                  icon: Bank,
                  title: "Treasury clarity",
                  copy: "Balances, FX, and cards in one operational picture.",
                },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <li key={row.title} className="flex gap-4 border-t border-white/15 pt-5">
                    <Icon
                      weight="duotone"
                      className="mt-0.5 h-6 w-6 shrink-0 text-gold"
                      aria-hidden
                    />
                    <div>
                      <p className="font-semibold">{row.title}</p>
                      <p className="mt-1 text-sm text-white/65">{row.copy}</p>
                    </div>
                  </li>
                );
              })}
            </motion.ul>
          </div>
        </section>

        {/* Flow */}
        <section id="flow" className="bg-fog px-5 py-24 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fade()}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald">
                How it works
              </p>
              <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink sm:text-5xl">
                From license to live corridor in three steps.
              </h2>
            </motion.div>
            <ol className="mt-14 grid gap-10 md:grid-cols-3">
              {steps.map((step, i) => (
                <motion.li key={step.n} {...fade(0.08 * i)}>
                  <span className="font-[family-name:var(--font-display)] text-5xl text-emerald/40">
                    {step.n}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">
                    {step.copy}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* Contact CTA */}
        <section
          id="contact"
          className="relative overflow-hidden bg-paper px-5 py-24 sm:px-8 sm:py-32"
        >
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 80% 20%, rgba(13,107,82,0.12), transparent), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(176,138,60,0.1), transparent)",
            }}
            aria-hidden
          />
          <motion.div
            className="relative mx-auto max-w-3xl text-center"
            {...fade()}
          >
            <h2 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink sm:text-5xl">
              Ready to open your corridor?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted">
              Tell us where you collect and where you pay. We will map the
              rails and the compliance path.
            </p>
            <a
              href="mailto:hello@sibtech.ca"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-ink-soft"
            >
              hello@sibtech.ca
              <ArrowRight weight="bold" className="h-4 w-4" />
            </a>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-line bg-paper px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-[family-name:var(--font-display)] text-lg text-ink">
            Sibtech
          </p>
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Sibtech Llc. Canadian-licensed fintech
            platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
