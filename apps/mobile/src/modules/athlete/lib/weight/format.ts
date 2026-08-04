/** Convert ASCII digits to Persian digits. */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}

export function formatWeightKg(kg: number, unit: string): string {
  const formatted = toPersianDigits(
    kg.toLocaleString("fa-IR", {
      maximumFractionDigits: 1,
      minimumFractionDigits: Number.isInteger(kg) ? 0 : 1,
    }),
  );
  return `${formatted} ${unit}`;
}

export function formatPercent(value: number): string {
  const sign = value < 0 ? "−" : "";
  const abs = Math.abs(value).toLocaleString("fa-IR", {
    maximumFractionDigits: 1,
  });
  return `${sign}${toPersianDigits(abs)}٪`;
}

/** 24h clock → Persian digits, e.g. ۱۴:۲۵ */
export function formatTimeFa(hours: number, minutes: number): string {
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return toPersianDigits(`${hh}:${mm}`);
}
