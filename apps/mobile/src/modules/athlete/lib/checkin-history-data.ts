export type CheckInMethod = "qr" | "barcode" | "manual";

export type AthleteCheckInItem = {
  id: string;
  clubId: string;
  clubName: string;
  method: CheckInMethod;
  occurredAt: string;
  occurredLabel: string;
  timeLabel: string;
};

/** Demo check-ins for signed-out / API-fallback mode. */
export const DEMO_CHECK_INS: AthleteCheckInItem[] = [
  {
    id: "demo-1",
    clubId: "demo-club-1",
    clubName: "باشگاه انرژی تهران",
    method: "qr",
    occurredAt: new Date().toISOString(),
    occurredLabel: "امروز",
    timeLabel: "۰۹:۱۵",
  },
  {
    id: "demo-2",
    clubId: "demo-club-1",
    clubName: "باشگاه انرژی تهران",
    method: "manual",
    occurredAt: new Date(Date.now() - 86_400_000).toISOString(),
    occurredLabel: "دیروز",
    timeLabel: "۱۸:۴۰",
  },
  {
    id: "demo-3",
    clubId: "demo-club-2",
    clubName: "فیت‌کلاب ونک",
    method: "barcode",
    occurredAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    occurredLabel: new Date(Date.now() - 3 * 86_400_000).toLocaleDateString(
      "fa-IR",
      { weekday: "long", day: "numeric", month: "long" },
    ),
    timeLabel: "۰۷:۵۰",
  },
];
