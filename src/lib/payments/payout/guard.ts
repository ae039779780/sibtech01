const PAN_DIGITS = /^(?:\d[ \-]*){12,19}$/;
const COMPACT_PAN = /^\d{12,19}$/;
const VPA = /^[\w.\-]{2,256}@[a-zA-Z][\w.\-]{1,63}$/;

export function looksLikePan(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const compact = trimmed.replace(/[\s-]/g, "");
  return COMPACT_PAN.test(compact) || PAN_DIGITS.test(trimmed);
}

export function assertNotPan(value: string) {
  if (looksLikePan(value)) {
    throw new Error("Push2card cannot accept a PAN — use a partner card token from the vault iframe");
  }
}

export function isPartnerCardToken(value: string): boolean {
  const trimmed = value.trim();
  return /^(tok|cardtok)_[a-z0-9_]+$/i.test(trimmed) && !looksLikePan(trimmed);
}

export function assertUpiVpa(value: string) {
  if (!VPA.test(value.trim())) {
    throw new Error("Enter a VPA / UPI ID like name@oksbi");
  }
}

export function assertBankDestination(input: { accountNumber?: string; iban?: string }) {
  if (!input.accountNumber?.trim() && !input.iban?.trim()) {
    throw new Error("Bank payouts need an account number or IBAN");
  }
}
