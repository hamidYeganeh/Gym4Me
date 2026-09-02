import { objectIdFrom, type DatabaseModels } from "@gym4me/api-server/database";

async function expirePayments(models: DatabaseModels, now: Date) {
  for (;;) {
    const payment = (await models.Payment.findOneAndUpdate(
      { status: "pending", expiresAt: { $lte: now } },
      {
        $set: { status: "expired", failedAt: now },
        $push: { attempts: { status: "expired", expiredAt: now } },
      },
      { sort: { expiresAt: 1 }, returnDocument: "after" },
    )) as any;
    if (!payment) break;
    if (["booking", "booking_series"].includes(payment.payable?.type)) {
      const filter =
        payment.payable.type === "booking_series"
          ? { seriesId: payment.payable.id }
          : { _id: payment.payable.id };
      await models.Booking.updateMany(
        { ...filter, status: "pending_payment" },
        {
          $set: {
            status: "cancelled",
            "payment.status": "expired",
            cancellation: {
              reason: "مهلت پرداخت به پایان رسید",
              source: "payment_timeout",
              cancelledAt: now,
            },
          },
        },
      );
      if (payment.payable.type === "booking_series")
        await models.BookingSeries.updateOne(
          { _id: payment.payable.id },
          { $set: { status: "cancelled" } },
        );
    }
    await models.OutboxEvent.create({
      type: "payment.expired",
      aggregate: { type: "payment", id: payment._id },
      payload: { payerUserId: payment.payerUserId, payable: payment.payable },
      status: "pending",
    });
  }
}

async function hasCapacity(models: DatabaseModels, entry: any, now: Date) {
  if (entry.request.startsAt <= now) return false;
  const closed = await models.AvailabilityException.exists({
    resourceId: { $in: entry.request.resourceIds },
    status: "active",
    type: "closed",
    "period.startsAt": { $lt: entry.request.endsAt },
    "period.endsAt": { $gt: entry.request.startsAt },
  });
  if (closed) return false;
  for (const resourceId of entry.request.resourceIds) {
    const resource = (await models.Resource.findById(resourceId).lean()) as any;
    if (!resource || resource.status !== "active") return false;
    const [bookings, holds] = await Promise.all([
      models.Booking.find({
        status: { $in: ["pending_payment", "confirmed", "checked_in"] },
        allocations: {
          $elemMatch: {
            resourceId,
            startAt: { $lt: entry.request.endsAt },
            endAt: { $gt: entry.request.startsAt },
          },
        },
      }).lean() as any,
      models.BookingHold.find({
        status: "held",
        expiresAt: { $gt: now },
        allocations: {
          $elemMatch: {
            resourceId,
            startAt: { $lt: entry.request.endsAt },
            endAt: { $gt: entry.request.startsAt },
          },
        },
      }).lean() as any,
    ]);
    const rows = [...bookings, ...holds].flatMap((item: any) =>
      (item.allocations ?? []).filter(
        (allocation: any) =>
          String(allocation.resourceId) === String(resourceId) &&
          new Date(allocation.startAt) < entry.request.endsAt &&
          new Date(allocation.endAt) > entry.request.startsAt,
      ),
    );
    const used = rows.reduce((sum: number, row: any) => sum + Number(row.quantity ?? 1), 0);
    if (
      resource.capacity?.mode === "exclusive"
        ? rows.length > 0
        : used + Number(entry.request.participants) > Number(resource.capacity?.total ?? 1)
    )
      return false;
  }
  return true;
}

async function offerWaitlist(models: DatabaseModels, now: Date) {
  await models.WaitlistEntry.updateMany(
    { status: "offered", "notification.expiresAt": { $lte: now } },
    { $set: { status: "expired" } },
  );
  const candidates = (await models.WaitlistEntry.find({
    status: "waiting",
    "request.startsAt": { $gt: now },
  })
    .sort({ createdAt: 1 })
    .limit(25)
    .lean()) as any[];
  for (const entry of candidates)
    if (await hasCapacity(models, entry, now)) {
      const expiresAt = new Date(
        Math.min(entry.request.startsAt.getTime(), now.getTime() + 30 * 60_000),
      );
      const offered = (await models.WaitlistEntry.findOneAndUpdate(
        { _id: entry._id, status: "waiting" },
        {
          $set: { status: "offered", notification: { offeredAt: now, expiresAt, channel: "sms" } },
        },
        { returnDocument: "after" },
      )) as any;
      if (offered)
        await models.OutboxEvent.create({
          type: "waitlist.available",
          aggregate: { type: "waitlist_entry", id: offered._id },
          payload: { customerUserId: offered.customerUserId, expiresAt },
          status: "pending",
        });
    }
}

export async function runMaintenance(models: DatabaseModels) {
  const now = new Date();
  await models.BookingHold.updateMany(
    { status: "held", expiresAt: { $lte: now } },
    { $set: { status: "expired", releasedAt: now } },
  );
  await expirePayments(models, now);
  await models.Booking.updateMany(
    { status: "confirmed", "allocations.endAt": { $lt: new Date(now.getTime() - 30 * 60_000) } },
    { $set: { status: "no_show" } },
  );
  await offerWaitlist(models, now);
}
