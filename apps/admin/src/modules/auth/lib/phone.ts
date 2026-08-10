/** Mirrors API `IR_PHONE` / `normalizeIranPhone` without Nest throws. */
export const IR_PHONE = /^\+989\d{9}$/;

export const OTP_LENGTH = 6;
export const OTP_PATTERN = "^[0-9۰-۹٠-٩]+$";

/** Convert Persian/Arabic digits to ASCII and strip non-digits, capped at OTP length. */
export function normalizeOtpDigits(value: string, length = OTP_LENGTH) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\D/g, "")
    .slice(0, length);
}

function toAsciiDigits(input: string) {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[\s()-]/g, "");
}

/** Normalizes Iranian mobile numbers to E.164, e.g. +989383729627. Returns null if invalid. */
export function normalizeIranPhoneInput(input: string): string | null {
  const digits = toAsciiDigits(input.trim());
  if (!digits) return null;
  if (IR_PHONE.test(digits)) return digits;
  if (/^09\d{9}$/.test(digits)) return `+98${digits.slice(1)}`;
  if (/^989\d{9}$/.test(digits)) return `+${digits}`;
  if (/^00989\d{9}$/.test(digits)) return `+${digits.slice(2)}`;
  if (/^9\d{9}$/.test(digits)) return `+98${digits}`;
  return null;
}

export function isIranPhoneInput(input: string): boolean {
  return normalizeIranPhoneInput(input) !== null;
}
