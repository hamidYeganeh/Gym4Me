import { toPersianDigits } from "./weight/format";

export function localDateTimeValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function formatSelfTrackingDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatSummaryValue(value: number | null, unitLabel: string) {
  if (value == null) return "—";
  return `${toPersianDigits(Number(value.toFixed(2)))} ${unitLabel}`;
}
