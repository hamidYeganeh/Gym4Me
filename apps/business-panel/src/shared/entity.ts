export type Entity = Record<string, unknown>;

export function record(value: unknown): Entity {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Entity : {};
}

export function string(value: unknown, fallback = "—"): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function id(value: Entity): string {
  return string(value.id ?? value._id, "");
}

export function profile(value: Entity): Entity {
  return record(value.profile);
}

export function status(value: Entity): string {
  return string(value.status, "unknown");
}

export function money(minor: unknown, currency: unknown = "IRR"): string {
  const amount = Number(typeof minor === "string" ? minor : minor ?? 0);
  if (!Number.isFinite(amount)) return "—";
  const unit = currency === "IRT" ? "تومان" : "ریال";
  return `${amount.toLocaleString("fa-IR")} ${unit}`;
}

export function jalali(value: unknown): string {
  if (!(typeof value === "string" || value instanceof Date)) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? "—"
    : new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium" }).format(date);
}
