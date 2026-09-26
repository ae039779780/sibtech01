import { currencyDecimals } from "@/lib/currencies";

export type FxQuote = {
  pair: string;
  baseCurrency: string;
  quoteCurrency: string;
  side: "SELL_BASE" | "BUY_BASE";
  midRate: number;
  spreadBps: number;
  clientRate: number;
  amountMinor: bigint;
  resultMinor: bigint;
  inverse: number;
};

/** Mid rates versus CAD for the demo book (partner liquidity later). */
export const MID_VS_CAD: Record<string, number> = {
  CAD: 1,
  USD: 1.36,
  EUR: 1.48,
  GBP: 1.74,
  CHF: 1.58,
  JPY: 0.0092,
  AUD: 0.9,
  NZD: 0.82,
  SGD: 1.02,
  HKD: 0.174,
  CNY: 0.19,
  INR: 0.0164,
  ILS: 0.37,
  AED: 0.37,
  SAR: 0.363,
  MXN: 0.078,
  BRL: 0.25,
  ZAR: 0.076,
  SEK: 0.13,
  NOK: 0.13,
  DKK: 0.198,
  PLN: 0.345,
  TRY: 0.04,
  KRW: 0.00098,
  THB: 0.04,
  USDT: 1.36,
  USDC: 1.36,
  BTC: 136_000,
  ETH: 4_760,
  SOL: 272,
  XRP: 0.82,
  LTC: 122,
  BCH: 680,
};

export function midRate(base: string, quote: string): number {
  const baseCad = MID_VS_CAD[base] ?? 1;
  const quoteCad = MID_VS_CAD[quote] ?? 1;
  return baseCad / quoteCad;
}

export function applySpread(mid: number, spreadBps: number, favorHouse: "up" | "down"): number {
  const factor = spreadBps / 10_000;
  return favorHouse === "down" ? mid * (1 - factor / 2) : mid * (1 + factor / 2);
}

function scale(amount: bigint, rate: number, fromDecimals: number, toDecimals: number): bigint {
  const fromScale = 10 ** fromDecimals;
  const toScale = 10 ** toDecimals;
  const major = Number(amount) / fromScale;
  const converted = major * rate;
  return BigInt(Math.round(converted * toScale));
}

export function quoteFx(input: {
  fromCurrency: string;
  toCurrency: string;
  amountMinor: bigint;
  spreadBps: number;
}): FxQuote {
  if (input.fromCurrency === input.toCurrency) {
    throw new Error("Choose two different currencies");
  }
  const mid = midRate(input.fromCurrency, input.toCurrency);
  const clientRate = applySpread(mid, input.spreadBps, "down");
  const resultMinor = scale(
    input.amountMinor,
    clientRate,
    currencyDecimals(input.fromCurrency),
    currencyDecimals(input.toCurrency),
  );
  return {
    pair: `${input.fromCurrency}/${input.toCurrency}`,
    baseCurrency: input.fromCurrency,
    quoteCurrency: input.toCurrency,
    side: "SELL_BASE",
    midRate: mid,
    spreadBps: input.spreadBps,
    clientRate,
    amountMinor: input.amountMinor,
    resultMinor,
    inverse: 1 / clientRate,
  };
}

export function spreadRevenueMinor(
  fromAmount: bigint,
  mid: number,
  clientRate: number,
  fromDecimals: number,
  houseCurrencyDecimals: number,
): bigint {
  const fromMajor = Number(fromAmount) / 10 ** fromDecimals;
  const midValue = fromMajor * mid;
  const clientValue = fromMajor * clientRate;
  const revenue = midValue - clientValue;
  return BigInt(Math.max(0, Math.round(revenue * 10 ** houseCurrencyDecimals)));
}
