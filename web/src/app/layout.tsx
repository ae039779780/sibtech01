import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sibtech | Canadian-licensed global money platform",
  description:
    "Wallet, global accounts, SWIFT and local payouts, crypto rails, cards, and FX — built for businesses that move money across borders.",
  openGraph: {
    title: "Sibtech",
    description:
      "Canadian-licensed fintech platform for wallet, accounts, payouts, cards, and FX.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
