type Rule = {
  schedule?: { dayOfWeek?: number; periods?: Array<{ startsAt?: string; endsAt?: string }> };
  validity?: { startsOn?: Date; endsOn?: Date };
  capacity?: { total?: number };
  priority?: number;
};
type Exception = {
  type?: string;
  period?: { startsAt?: Date; endsAt?: Date };
  capacity?: { total?: number };
  reason?: string;
};

const dayMs = 86_400_000;
const localDateFormatter = (timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
function parts(formatter: Intl.DateTimeFormat, date: Date) {
  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}
function localDate(date: Date, timeZone: string) {
  const value = parts(localDateFormatter(timeZone), date);
  return `${value.year}-${value.month}-${value.day}`;
}
function addLocalDay(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day! + 1)).toISOString().slice(0, 10);
}
function localDayOfWeek(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!)).getUTCDay();
}
function zonedDate(value: string, clock: string, timeZone: string) {
  const [year, month, day] = value.split("-").map(Number);
  const [hour, minute] = clock.split(":").map(Number);
  const desired = Date.UTC(year!, month! - 1, day!, hour!, minute!);
  let result = desired;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  for (let index = 0; index < 2; index += 1) {
    const current = parts(formatter, new Date(result));
    const represented = Date.UTC(
      Number(current.year),
      Number(current.month) - 1,
      Number(current.day),
      Number(current.hour),
      Number(current.minute),
    );
    result += desired - represented;
  }
  return new Date(result);
}
function overlaps(start: Date, end: Date, exception: Exception) {
  const from = exception.period?.startsAt;
  const to = exception.period?.endsAt;
  return Boolean(from && to && start < to && end > from);
}

export interface MaterializedSlot {
  startAt: string;
  endAt: string;
  localDate: string;
  startsAtLocal: string;
  endsAtLocal: string;
  capacity: { total: number; reserved: number; available: number };
  status: "available" | "full" | "closed";
  exceptionReason?: string;
}

export function materializeSlots(input: {
  from: Date;
  to: Date;
  timeZone: string;
  durationMinutes: number;
  participants: number;
  defaultCapacity: number;
  rules: Rule[];
  exceptions: Exception[];
  reservations?: Array<{ startAt: Date; endAt: Date; quantity: number }>;
}) {
  const slots: MaterializedSlot[] = [];
  let date = localDate(input.from, input.timeZone);
  const lastDate = localDate(new Date(input.to.getTime() - 1), input.timeZone);
  while (date <= lastDate) {
    const day = localDayOfWeek(date);
    for (const rule of input.rules
      .filter((item) => item.schedule?.dayOfWeek === day)
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))) {
      const dayStart = zonedDate(date, "00:00", input.timeZone);
      if (rule.validity?.startsOn && dayStart < new Date(rule.validity.startsOn)) continue;
      if (rule.validity?.endsOn && dayStart > new Date(rule.validity.endsOn)) continue;
      for (const period of rule.schedule?.periods ?? []) {
        if (!period.startsAt || !period.endsAt) continue;
        let start = zonedDate(date, period.startsAt, input.timeZone);
        const periodEnd = zonedDate(date, period.endsAt, input.timeZone);
        while (start.getTime() + input.durationMinutes * 60_000 <= periodEnd.getTime()) {
          const end = new Date(start.getTime() + input.durationMinutes * 60_000);
          if (start >= input.from && end <= input.to) {
            const exception = input.exceptions.filter((item) => overlaps(start, end, item)).at(-1);
            const closed = exception?.type === "closed";
            const total =
              exception?.type === "capacity_override"
                ? (exception.capacity?.total ?? 0)
                : (rule.capacity?.total ?? input.defaultCapacity);
            const reserved = (input.reservations ?? [])
              .filter((item) => start < item.endAt && end > item.startAt)
              .reduce((sum, item) => sum + item.quantity, 0);
            const available = Math.max(0, total - reserved);
            const status = closed
              ? "closed"
              : available >= input.participants
                ? "available"
                : "full";
            slots.push({
              startAt: start.toISOString(),
              endAt: end.toISOString(),
              localDate: date,
              startsAtLocal: period.startsAt,
              endsAtLocal: new Intl.DateTimeFormat("en-GB", {
                timeZone: input.timeZone,
                hour: "2-digit",
                minute: "2-digit",
                hourCycle: "h23",
              }).format(end),
              capacity: { total, reserved, available },
              status,
              ...(exception?.reason ? { exceptionReason: exception.reason } : {}),
            });
          }
          start = new Date(start.getTime() + input.durationMinutes * 60_000);
        }
      }
    }
    date = addLocalDay(date);
  }
  return slots
    .filter(
      (slot, index, all) =>
        all.findIndex(
          (candidate) => candidate.startAt === slot.startAt && candidate.endAt === slot.endAt,
        ) === index,
    )
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}
