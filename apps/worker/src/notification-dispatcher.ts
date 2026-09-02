import type { DatabaseModels } from "@gym4me/api-server/database";
import { sendPush } from "./push-provider.js";

type Models = DatabaseModels;
const templates: Record<string, string> = {
  booking_confirmed: "رزرو شما در Gym4Me با موفقیت تأیید شد. کد رزرو: {bookingId}",
  booking_reminder: "یادآوری Gym4Me: رزرو {bookingId} در {startsAt} شروع می‌شود.",
  booking_cancelled: "رزرو {bookingId} لغو شد. جزئیات بازپرداخت در کیف پول شما قابل مشاهده است.",
  booking_rescheduled: "زمان رزرو {bookingId} تغییر کرد. زمان جدید: {startsAt}",
  waitlist_available: "برای سانس درخواستی شما ظرفیت آزاد شده است. تا {expiresAt} فرصت رزرو دارید.",
  payment_failed: "پرداخت Gym4Me ناموفق یا منقضی شد. ظرفیت رزرو آزاد شده است.",
};

const interpolate = (text: string, values: Record<string, unknown>) =>
  text.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => String(values[key] ?? ""));

export async function ensureNotificationTemplates(models: Models) {
  for (const [code, text] of Object.entries(templates))
    await models.NotificationTemplate.updateOne(
      { code },
      {
        $setOnInsert: {
          code,
          channel: "sms",
          locale: "fa-IR",
          content: { text },
          provider: { code: "kavenegar" },
          status: "active",
        },
      },
      { upsert: true },
    );
}

async function enqueue(
  models: Models,
  code: string,
  userId: unknown,
  payload: Record<string, unknown>,
  sendAt: Date,
  dedupeKey: string,
) {
  const template = (await models.NotificationTemplate.findOne({
    code,
    status: "active",
  }).lean()) as any;
  if (!template || !userId) return;
  const preference = (await models.NotificationPreference.findOne({ userId }).lean()) as any;
  const channels = [
    ...(preference?.channels?.inApp === "disabled" ? [] : ["in_app"]),
    ...(preference?.channels?.sms === "disabled" ? [] : ["sms"]),
    ...(preference?.channels?.push === "disabled" ? [] : ["push"]),
  ];
  for (const channel of channels)
    await models.NotificationJob.updateOne(
      { dedupeKey: `${dedupeKey}:${channel}` },
      {
        $setOnInsert: {
          templateId: template._id,
          dedupeKey: `${dedupeKey}:${channel}`,
          recipient: { type: "user", id: userId, channel },
          payload,
          schedule: { sendAt },
          delivery: { attempts: 0 },
          status: "pending",
        },
      },
      { upsert: true },
    );
}

async function bookingByIds(models: Models, ids: unknown[]) {
  return models.Booking.find({ _id: { $in: ids } }).lean() as any;
}
async function scheduleBooking(models: Models, booking: any, confirmation = true) {
  const bookingId = String(booking._id);
  const startsAt = new Date(booking.allocations?.[0]?.startAt);
  if (!Number.isFinite(startsAt.getTime())) return;
  if (confirmation)
    await enqueue(
      models,
      "booking_confirmed",
      booking.customerUserId,
      {
        bookingId,
        startsAt: startsAt.toISOString(),
        action: `/athlete/bookings/${bookingId}`,
      },
      new Date(),
      `booking:${bookingId}:confirmed`,
    );
  const reminderMinutes = Number(process.env.BOOKING_REMINDER_MINUTES ?? 120);
  const reminderAt = new Date(startsAt.getTime() - reminderMinutes * 60_000);
  if (reminderAt > new Date())
    await enqueue(
      models,
      "booking_reminder",
      booking.customerUserId,
      {
        bookingId,
        startsAt: startsAt.toISOString(),
        action: `/athlete/bookings/${bookingId}`,
      },
      reminderAt,
      `booking:${bookingId}:reminder:${reminderMinutes}`,
    );
}

export async function routeOutboxEvent(models: Models, event: any) {
  const type = String(event.type);
  const payload = event.payload ?? {};
  if (type === "booking.created") {
    for (const booking of await bookingByIds(models, payload.bookingIds ?? []))
      if (booking.status === "confirmed") await scheduleBooking(models, booking);
    return;
  }
  if (type === "booking.payment_confirmed" || type === "payment.paid") {
    let bookings: any[] = [];
    if (payload.paymentId) {
      const payment = (await models.Payment.findById(payload.paymentId).lean()) as any;
      if (payment?.payable?.type === "booking")
        bookings = await bookingByIds(models, [payment.payable.id]);
      if (payment?.payable?.type === "booking_series")
        bookings = (await models.Booking.find({ seriesId: payment.payable.id }).lean()) as any;
    } else if (payload.payable?.type === "booking")
      bookings = await bookingByIds(models, [payload.payable.id]);
    else if (payload.payable?.type === "booking_series")
      bookings = (await models.Booking.find({ seriesId: payload.payable.id }).lean()) as any;
    for (const booking of bookings) await scheduleBooking(models, booking);
    return;
  }
  if (type === "booking.cancelled")
    await enqueue(
      models,
      "booking_cancelled",
      payload.customerUserId,
      {
        bookingId: String(event.aggregate?.id ?? ""),
        action: `/athlete/bookings/${String(event.aggregate?.id ?? "")}`,
      },
      new Date(),
      `booking:${String(event.aggregate?.id)}:cancelled`,
    );
  if (type === "booking.rescheduled")
    await enqueue(
      models,
      "booking_rescheduled",
      payload.customerUserId,
      {
        bookingId: String(event.aggregate?.id ?? ""),
        startsAt: new Date(payload.startsAt).toISOString(),
        action: `/athlete/bookings/${String(event.aggregate?.id ?? "")}`,
      },
      new Date(),
      `booking:${String(event.aggregate?.id)}:rescheduled:${new Date(payload.startsAt).getTime()}`,
    );
  if (type === "waitlist.available")
    await enqueue(
      models,
      "waitlist_available",
      payload.customerUserId,
      {
        expiresAt: new Date(payload.expiresAt).toISOString(),
        action: "/athlete/waitlist",
      },
      new Date(),
      `waitlist:${String(event.aggregate?.id)}:available`,
    );
  if (["payment.failed", "payment.cancelled", "payment.expired"].includes(type))
    await enqueue(
      models,
      "payment_failed",
      payload.payerUserId,
      {
        paymentId: String(event.aggregate?.id ?? ""),
        action: "/athlete/wallet",
      },
      new Date(),
      `payment:${String(event.aggregate?.id)}:${type}`,
    );
}

const kavenegarLookupTemplates: Record<string, { env: string; fallback: string }> = {
  booking_confirmed: {
    env: "KAVENEGAR_TEMPLATE_BOOKING_CONFIRMED",
    fallback: "gym4mebookingconfirmed",
  },
  booking_reminder: {
    env: "KAVENEGAR_TEMPLATE_BOOKING_REMINDER",
    fallback: "gym4mebookingreminder",
  },
  booking_cancelled: {
    env: "KAVENEGAR_TEMPLATE_BOOKING_CANCELLED",
    fallback: "gym4mebookingcancelled",
  },
  booking_rescheduled: {
    env: "KAVENEGAR_TEMPLATE_BOOKING_RESCHEDULED",
    fallback: "gym4mebookingrescheduled",
  },
  waitlist_available: {
    env: "KAVENEGAR_TEMPLATE_WAITLIST_AVAILABLE",
    fallback: "gym4mewaitlist",
  },
  payment_failed: {
    env: "KAVENEGAR_TEMPLATE_PAYMENT_FAILED",
    fallback: "gym4mepaymentfailed",
  },
};

function lookupDate(value: unknown) {
  const date = new Date(String(value ?? ""));
  if (!Number.isFinite(date.getTime())) return undefined;
  const parts = new Intl.DateTimeFormat("en-CA-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Tehran",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;
  return [part("year"), part("month"), part("day"), part("hour"), part("minute")]
    .filter(Boolean)
    .join(" ");
}

export function kavenegarLookupInput(code: string, payload: Record<string, unknown>) {
  const definition = kavenegarLookupTemplates[code];
  if (!definition) return null;
  const template = process.env[definition.env]?.trim() || definition.fallback;
  if (code === "booking_reminder" || code === "booking_rescheduled")
    return { template, token: String(payload.bookingId ?? ""), token10: lookupDate(payload.startsAt) };
  if (code === "waitlist_available")
    return { template, token: "Gym4Me", token10: lookupDate(payload.expiresAt) };
  if (code === "payment_failed")
    return { template, token: String(payload.paymentId ?? "") };
  return { template, token: String(payload.bookingId ?? "") };
}

async function sendSms(
  receptor: string,
  message: string,
  lookup: { template: string; token: string; token10?: string | undefined } | null,
) {
  const apiKey = process.env.KAVENEGAR_API_KEY;
  if (!apiKey || process.env.NOTIFICATION_PROVIDER !== "kavenegar") {
    process.stdout.write(`[DEV SMS] ${receptor}: ${message}\n`);
    return { messageId: `console-${Date.now()}` };
  }
  const endpoint = new URL(
    `https://api.kavenegar.com/v1/${apiKey}/${lookup ? "verify/lookup" : "sms/send"}.json`,
  );
  endpoint.searchParams.set("receptor", receptor);
  if (lookup) {
    endpoint.searchParams.set("template", lookup.template);
    endpoint.searchParams.set("token", lookup.token);
    if (lookup.token10) endpoint.searchParams.set("token10", lookup.token10);
  } else endpoint.searchParams.set("message", message);
  if (!lookup && process.env.KAVENEGAR_SENDER)
    endpoint.searchParams.set("sender", process.env.KAVENEGAR_SENDER);
  const response = await fetch(endpoint, { method: "POST", signal: AbortSignal.timeout(10_000) });
  const body = (await response.json()) as any;
  if (!response.ok || body.return?.status !== 200)
    throw new Error(
      `Kavenegar SMS delivery failed (${response.status}/${body.return?.status ?? "unknown"})`,
    );
  return { messageId: body.entries?.[0]?.messageid?.toString() };
}

export async function processNotificationJob(models: Models) {
  const now = new Date();
  const job = (await models.NotificationJob.findOneAndUpdate(
    {
      status: "pending",
      "schedule.sendAt": { $lte: now },
      $or: [{ "delivery.lockedUntil": null }, { "delivery.lockedUntil": { $lt: now } }],
    },
    {
      $set: { status: "processing", "delivery.lockedUntil": new Date(now.getTime() + 30_000) },
      $inc: { "delivery.attempts": 1 },
    },
    { sort: { "schedule.sendAt": 1 }, returnDocument: "after" },
  )) as any;
  if (!job) return false;
  try {
    if (job.source?.type === "announcement" && job.source?.id)
      await models.Announcement.updateOne(
        { _id: job.source.id, status: "scheduled" },
        { $set: { status: "published", "schedule.publishedAt": new Date() } },
      );
    if (job.recipient?.channel === "in_app") {
      await job.updateOne({
        $set: {
          status: "sent",
          "delivery.deliveredAt": new Date(),
          "delivery.lockedUntil": null,
        },
      });
      return true;
    }
    const [template, user] = await Promise.all([
      models.NotificationTemplate.findById(job.templateId).lean() as any,
      models.User.findById(job.recipient.id).lean() as any,
    ]);
    if (job.recipient?.channel === "push") {
      if (!template) throw new Error("Notification template is missing");
      const installations = (await models.DeviceInstallation.find({
        userId: job.recipient.id,
        status: "active",
        "push.token": { $exists: true },
      }).lean()) as any[];
      if (!installations.length) {
        await job.updateOne({
          $set: {
            status: "skipped",
            "delivery.lastError": "No active push installation",
            "delivery.lockedUntil": null,
          },
        });
        return true;
      }
      const message = interpolate(
        template.content?.text ?? job.payload?.message ?? "",
        job.payload ?? {},
      );
      const rawAction = job.payload?.action;
      const action =
        typeof rawAction === "string"
          ? rawAction
          : rawAction && typeof rawAction === "object" && typeof rawAction.url === "string"
            ? rawAction.url
            : undefined;
      const result = await sendPush(
        installations.map((installation) => ({
          token: String(installation.push.token),
          provider: String(installation.push.provider) as "fcm" | "apns" | "webpush",
        })),
        {
          title: String(job.payload?.title ?? "Gym4Me"),
          body: message,
          data: {
            ...(action ? { action } : {}),
            jobId: String(job._id),
          },
        },
      );
      if (result.invalidTokens.length)
        await models.DeviceInstallation.updateMany(
          { userId: job.recipient.id, "push.token": { $in: result.invalidTokens } },
          {
            $set: {
              status: "revoked",
              revokedAt: new Date(),
              revokeReason: "provider_invalid_token",
            },
          },
        );
      await job.updateOne({
        $set: {
          status: "sent",
          "delivery.sentAt": new Date(),
          "delivery.providerMessageIds": result.messageIds,
          "delivery.deviceCount": installations.length,
          "delivery.lastError": null,
          "delivery.lockedUntil": null,
        },
      });
      return true;
    }
    const mobile = user?.contact?.mobile?.value;
    if (!template || !mobile) throw new Error("Notification recipient or template is missing");
    const message = interpolate(template.content?.text ?? "", job.payload ?? {});
    const result = await sendSms(
      mobile,
      message,
      kavenegarLookupInput(String(template.code ?? ""), job.payload ?? {}),
    );
    await job.updateOne({
      $set: {
        status: "sent",
        "delivery.sentAt": new Date(),
        "delivery.providerMessageId": result.messageId,
        "delivery.lastError": null,
        "delivery.lockedUntil": null,
      },
    });
  } catch (error) {
    const attempts = Number(job.delivery?.attempts ?? 1);
    await job.updateOne({
      $set: {
        status: attempts >= 5 ? "failed" : "pending",
        "schedule.sendAt": new Date(Date.now() + Math.min(30 * 60_000, 2 ** attempts * 30_000)),
        "delivery.lastError": error instanceof Error ? error.message : "Unknown notification error",
        "delivery.lockedUntil": null,
      },
    });
  }
  return true;
}

export async function reconcileKavenegarDeliveries(models: Models) {
  const apiKey = process.env.KAVENEGAR_API_KEY;
  if (!apiKey || process.env.NOTIFICATION_PROVIDER !== "kavenegar") return false;
  const now = new Date();
  const jobs = (await models.NotificationJob.find({
    status: "sent",
    "recipient.channel": "sms",
    "delivery.providerMessageId": { $exists: true },
    "delivery.sentAt": { $gt: new Date(now.getTime() - 48 * 60 * 60_000) },
    $or: [
      { "delivery.reconciliation.checkedAt": { $exists: false } },
      { "delivery.reconciliation.checkedAt": { $lt: new Date(now.getTime() - 5 * 60_000) } },
    ],
  })
    .sort({ "delivery.sentAt": 1 })
    .limit(500)
    .lean()) as any[];
  if (!jobs.length) return false;
  const endpoint = new URL(`https://api.kavenegar.com/v1/${apiKey}/sms/status.json`);
  endpoint.searchParams.set(
    "messageid",
    jobs.map((job) => String(job.delivery.providerMessageId)).join(","),
  );
  const response = await fetch(endpoint, { method: "GET", signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Kavenegar status request failed with ${response.status}`);
  const body = (await response.json()) as any;
  if (body.return?.status !== 200 || !Array.isArray(body.entries))
    throw new Error(`Kavenegar status response failed: ${body.return?.message ?? "unknown"}`);
  for (const entry of body.entries) {
    const job = jobs.find(
      (item) => String(item.delivery.providerMessageId) === String(entry.messageid),
    );
    if (!job) continue;
    const providerStatus = Number(entry.status);
    const status =
      providerStatus === 10
        ? "delivered"
        : [6, 11, 13, 14, 100].includes(providerStatus)
          ? "undelivered"
          : "sent";
    await models.NotificationJob.updateOne(
      { _id: job._id },
      {
        $set: {
          status,
          "delivery.reconciliation.checkedAt": now,
          "delivery.reconciliation.providerStatus": providerStatus,
          "delivery.reconciliation.providerStatusText": entry.statustext,
          ...(status === "delivered" ? { "delivery.deliveredAt": now } : {}),
          ...(status === "undelivered" ? { "delivery.undeliveredAt": now } : {}),
        },
      },
    );
  }
  return true;
}
