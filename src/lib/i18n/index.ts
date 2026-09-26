import { en, type Messages } from "./en";

export type Locale = "en";

const catalogs: Record<Locale, Messages> = { en };

export function t(locale: Locale = "en"): Messages {
  return catalogs[locale] ?? en;
}

export { en };
