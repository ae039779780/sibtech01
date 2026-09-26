export type AssetClass = "fiat" | "crypto";

export type Currency = {
  code: string;
  name: string;
  decimals: number;
  class: AssetClass;
  region?: string;
};

export const CURRENCIES: Currency[] = [
  { code: "CAD", name: "Canadian Dollar", decimals: 2, class: "fiat", region: "CA" },
  { code: "USD", name: "US Dollar", decimals: 2, class: "fiat", region: "US" },
  { code: "EUR", name: "Euro", decimals: 2, class: "fiat", region: "EU" },
  { code: "GBP", name: "British Pound", decimals: 2, class: "fiat", region: "GB" },
  { code: "CHF", name: "Swiss Franc", decimals: 2, class: "fiat", region: "CH" },
  { code: "JPY", name: "Japanese Yen", decimals: 0, class: "fiat", region: "JP" },
  { code: "AUD", name: "Australian Dollar", decimals: 2, class: "fiat", region: "AU" },
  { code: "NZD", name: "New Zealand Dollar", decimals: 2, class: "fiat", region: "NZ" },
  { code: "SGD", name: "Singapore Dollar", decimals: 2, class: "fiat", region: "SG" },
  { code: "HKD", name: "Hong Kong Dollar", decimals: 2, class: "fiat", region: "HK" },
  { code: "CNY", name: "Chinese Yuan", decimals: 2, class: "fiat", region: "CN" },
  { code: "INR", name: "Indian Rupee", decimals: 2, class: "fiat", region: "IN" },
  { code: "KRW", name: "South Korean Won", decimals: 0, class: "fiat", region: "KR" },
  { code: "BRL", name: "Brazilian Real", decimals: 2, class: "fiat", region: "BR" },
  { code: "MXN", name: "Mexican Peso", decimals: 2, class: "fiat", region: "MX" },
  { code: "ZAR", name: "South African Rand", decimals: 2, class: "fiat", region: "ZA" },
  { code: "AED", name: "UAE Dirham", decimals: 2, class: "fiat", region: "AE" },
  { code: "SAR", name: "Saudi Riyal", decimals: 2, class: "fiat", region: "SA" },
  { code: "QAR", name: "Qatari Riyal", decimals: 2, class: "fiat", region: "QA" },
  { code: "KWD", name: "Kuwaiti Dinar", decimals: 3, class: "fiat", region: "KW" },
  { code: "BHD", name: "Bahraini Dinar", decimals: 3, class: "fiat", region: "BH" },
  { code: "OMR", name: "Omani Rial", decimals: 3, class: "fiat", region: "OM" },
  { code: "JOD", name: "Jordanian Dinar", decimals: 3, class: "fiat", region: "JO" },
  { code: "ILS", name: "Israeli Shekel", decimals: 2, class: "fiat", region: "IL" },
  { code: "TRY", name: "Turkish Lira", decimals: 2, class: "fiat", region: "TR" },
  { code: "PLN", name: "Polish Zloty", decimals: 2, class: "fiat", region: "PL" },
  { code: "SEK", name: "Swedish Krona", decimals: 2, class: "fiat", region: "SE" },
  { code: "NOK", name: "Norwegian Krone", decimals: 2, class: "fiat", region: "NO" },
  { code: "DKK", name: "Danish Krone", decimals: 2, class: "fiat", region: "DK" },
  { code: "CZK", name: "Czech Koruna", decimals: 2, class: "fiat", region: "CZ" },
  { code: "HUF", name: "Hungarian Forint", decimals: 2, class: "fiat", region: "HU" },
  { code: "RON", name: "Romanian Leu", decimals: 2, class: "fiat", region: "RO" },
  { code: "BGN", name: "Bulgarian Lev", decimals: 2, class: "fiat", region: "BG" },
  { code: "ISK", name: "Icelandic Krona", decimals: 0, class: "fiat", region: "IS" },
  { code: "THB", name: "Thai Baht", decimals: 2, class: "fiat", region: "TH" },
  { code: "MYR", name: "Malaysian Ringgit", decimals: 2, class: "fiat", region: "MY" },
  { code: "IDR", name: "Indonesian Rupiah", decimals: 2, class: "fiat", region: "ID" },
  { code: "PHP", name: "Philippine Peso", decimals: 2, class: "fiat", region: "PH" },
  { code: "VND", name: "Vietnamese Dong", decimals: 0, class: "fiat", region: "VN" },
  { code: "TWD", name: "Taiwan Dollar", decimals: 2, class: "fiat", region: "TW" },
  { code: "PKR", name: "Pakistani Rupee", decimals: 2, class: "fiat", region: "PK" },
  { code: "BDT", name: "Bangladeshi Taka", decimals: 2, class: "fiat", region: "BD" },
  { code: "LKR", name: "Sri Lankan Rupee", decimals: 2, class: "fiat", region: "LK" },
  { code: "NPR", name: "Nepalese Rupee", decimals: 2, class: "fiat", region: "NP" },
  { code: "EGP", name: "Egyptian Pound", decimals: 2, class: "fiat", region: "EG" },
  { code: "MAD", name: "Moroccan Dirham", decimals: 2, class: "fiat", region: "MA" },
  { code: "TND", name: "Tunisian Dinar", decimals: 3, class: "fiat", region: "TN" },
  { code: "NGN", name: "Nigerian Naira", decimals: 2, class: "fiat", region: "NG" },
  { code: "KES", name: "Kenyan Shilling", decimals: 2, class: "fiat", region: "KE" },
  { code: "GHS", name: "Ghanaian Cedi", decimals: 2, class: "fiat", region: "GH" },
  { code: "UGX", name: "Ugandan Shilling", decimals: 0, class: "fiat", region: "UG" },
  { code: "TZS", name: "Tanzanian Shilling", decimals: 2, class: "fiat", region: "TZ" },
  { code: "XOF", name: "West African CFA", decimals: 0, class: "fiat", region: "WAEMU" },
  { code: "XAF", name: "Central African CFA", decimals: 0, class: "fiat", region: "CEMAC" },
  { code: "XCD", name: "East Caribbean Dollar", decimals: 2, class: "fiat", region: "OECS" },
  { code: "JMD", name: "Jamaican Dollar", decimals: 2, class: "fiat", region: "JM" },
  { code: "TTD", name: "Trinidad Dollar", decimals: 2, class: "fiat", region: "TT" },
  { code: "BBD", name: "Barbadian Dollar", decimals: 2, class: "fiat", region: "BB" },
  { code: "BSD", name: "Bahamian Dollar", decimals: 2, class: "fiat", region: "BS" },
  { code: "BMD", name: "Bermudian Dollar", decimals: 2, class: "fiat", region: "BM" },
  { code: "KYD", name: "Cayman Islands Dollar", decimals: 2, class: "fiat", region: "KY" },
  { code: "CLP", name: "Chilean Peso", decimals: 0, class: "fiat", region: "CL" },
  { code: "COP", name: "Colombian Peso", decimals: 2, class: "fiat", region: "CO" },
  { code: "PEN", name: "Peruvian Sol", decimals: 2, class: "fiat", region: "PE" },
  { code: "ARS", name: "Argentine Peso", decimals: 2, class: "fiat", region: "AR" },
  { code: "UYU", name: "Uruguayan Peso", decimals: 2, class: "fiat", region: "UY" },
  { code: "BOB", name: "Bolivian Boliviano", decimals: 2, class: "fiat", region: "BO" },
  { code: "PYG", name: "Paraguayan Guarani", decimals: 0, class: "fiat", region: "PY" },
  { code: "CRC", name: "Costa Rican Colon", decimals: 2, class: "fiat", region: "CR" },
  { code: "GTQ", name: "Guatemalan Quetzal", decimals: 2, class: "fiat", region: "GT" },
  { code: "HNL", name: "Honduran Lempira", decimals: 2, class: "fiat", region: "HN" },
  { code: "NIO", name: "Nicaraguan Cordoba", decimals: 2, class: "fiat", region: "NI" },
  { code: "PAB", name: "Panamanian Balboa", decimals: 2, class: "fiat", region: "PA" },
  { code: "DOP", name: "Dominican Peso", decimals: 2, class: "fiat", region: "DO" },
  { code: "UAH", name: "Ukrainian Hryvnia", decimals: 2, class: "fiat", region: "UA" },
  { code: "KZT", name: "Kazakhstani Tenge", decimals: 2, class: "fiat", region: "KZ" },
  { code: "UZS", name: "Uzbekistani Som", decimals: 2, class: "fiat", region: "UZ" },
  { code: "GEL", name: "Georgian Lari", decimals: 2, class: "fiat", region: "GE" },
  { code: "AMD", name: "Armenian Dram", decimals: 2, class: "fiat", region: "AM" },
  { code: "AZN", name: "Azerbaijani Manat", decimals: 2, class: "fiat", region: "AZ" },
  { code: "MNT", name: "Mongolian Tugrik", decimals: 2, class: "fiat", region: "MN" },
  { code: "KHR", name: "Cambodian Riel", decimals: 2, class: "fiat", region: "KH" },
  { code: "LAK", name: "Lao Kip", decimals: 2, class: "fiat", region: "LA" },
  { code: "MMK", name: "Myanmar Kyat", decimals: 2, class: "fiat", region: "MM" },
  { code: "BND", name: "Brunei Dollar", decimals: 2, class: "fiat", region: "BN" },
  { code: "FJD", name: "Fijian Dollar", decimals: 2, class: "fiat", region: "FJ" },
  { code: "MUR", name: "Mauritian Rupee", decimals: 2, class: "fiat", region: "MU" },
  { code: "MVR", name: "Maldivian Rufiyaa", decimals: 2, class: "fiat", region: "MV" },
  { code: "SCR", name: "Seychellois Rupee", decimals: 2, class: "fiat", region: "SC" },
  { code: "BTC", name: "Bitcoin", decimals: 8, class: "crypto" },
  { code: "ETH", name: "Ether", decimals: 8, class: "crypto" },
  { code: "USDT", name: "Tether", decimals: 6, class: "crypto" },
  { code: "USDC", name: "USD Coin", decimals: 6, class: "crypto" },
  { code: "SOL", name: "Solana", decimals: 8, class: "crypto" },
  { code: "XRP", name: "XRP", decimals: 6, class: "crypto" },
  { code: "LTC", name: "Litecoin", decimals: 8, class: "crypto" },
  { code: "BCH", name: "Bitcoin Cash", decimals: 8, class: "crypto" },
];

const byCode = new Map(CURRENCIES.map((c) => [c.code, c]));

export function getCurrency(code: string): Currency {
  const found = byCode.get(code.toUpperCase());
  if (!found) {
    throw new Error(`Unknown currency: ${code}`);
  }
  return found;
}

export function currencyDecimals(code: string): number {
  return getCurrency(code).decimals;
}

export const WALLET_DEFAULTS: string[] = ["CAD", "USD", "EUR", "GBP", "USDT", "BTC"];
export const FIAT_WALLET_DEFAULTS: string[] = ["CAD", "USD", "EUR", "GBP"];

export function isCryptoCode(code: string): boolean {
  return getCurrency(code).class === "crypto";
}

export function walletCodesFor(cryptoFriendly: boolean): string[] {
  return cryptoFriendly ? [...WALLET_DEFAULTS] : [...FIAT_WALLET_DEFAULTS];
}
