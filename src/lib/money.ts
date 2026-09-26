export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}

export function toMinor(amount: string | number, decimals: number): bigint {
  const raw = typeof amount === "number" ? amount.toString() : amount.trim();
  if (!/^-?\d+(\.\d+)?$/.test(raw)) {
    throw new MoneyError(`Invalid amount: ${amount}`);
  }
  const negative = raw.startsWith("-");
  const [wholePart, frac = ""] = (negative ? raw.slice(1) : raw).split(".");
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  if (frac.length > decimals) {
    throw new MoneyError(`Too many decimal places for scale ${decimals}`);
  }
  const minor = BigInt(wholePart) * 10n ** BigInt(decimals) + BigInt(fracPadded || "0");
  return negative ? -minor : minor;
}

export function fromMinor(minor: bigint, decimals: number): string {
  const negative = minor < 0n;
  const abs = negative ? -minor : minor;
  const scale = 10n ** BigInt(decimals);
  const whole = abs / scale;
  const frac = (abs % scale).toString().padStart(decimals, "0");
  const body = decimals === 0 ? whole.toString() : `${whole}.${frac}`;
  return negative ? `-${body}` : body;
}

export function formatMoney(
  minor: bigint,
  decimals: number,
  currency: string,
  locale = "en-CA",
): string {
  const n = Number(fromMinor(minor, decimals));
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.length === 3 && !isCryptoTicker(currency) ? currency : "USD",
      currencyDisplay: isCryptoTicker(currency) ? "code" : "symbol",
      minimumFractionDigits: Math.min(decimals, 2),
      maximumFractionDigits: Math.min(decimals, 8),
    })
      .format(n)
      .replace("US$", currency === "USD" ? "$" : "")
      .replace(/^USD\s?/, isCryptoTicker(currency) ? `${currency} ` : "");
  } catch {
    return `${fromMinor(minor, decimals)} ${currency}`;
  }
}

export function isCryptoTicker(code: string): boolean {
  return ["BTC", "ETH", "USDT", "USDC", "SOL", "XRP", "LTC", "BCH"].includes(code);
}

export function parseMinorString(value: string): bigint {
  if (!/^-?\d+$/.test(value)) {
    throw new MoneyError(`Invalid minor units: ${value}`);
  }
  return BigInt(value);
}

export function sumMinor(values: bigint[]): bigint {
  return values.reduce((acc, v) => acc + v, 0n);
}
