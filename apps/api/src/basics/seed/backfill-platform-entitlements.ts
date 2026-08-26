/**
 * Idempotent phase-two backfill for ADR-0001.
 *
 * It only snapshots plans explicitly marked contractReady. Legacy plans remain
 * on the documented unlimited dual-read path until an admin supplies an
 * audience-safe contract; the command never infers entitlement semantics.
 */
import 'dotenv/config';
import mongoose, { Types } from 'mongoose';

export type BackfillPlatformEntitlementsOptions = {
  batchSize?: number;
  cursor?: string | null;
  dryRun?: boolean;
};

export type BackfillPlatformEntitlementsResult = {
  processed: number;
  updated: number;
  skippedLegacyPlan: number;
  nextCursor: string | null;
  hasMore: boolean;
};

export async function backfillPlatformEntitlements(
  connection: mongoose.Connection,
  options: BackfillPlatformEntitlementsOptions = {},
  now = new Date(),
): Promise<BackfillPlatformEntitlementsResult> {
  const batchSize = Math.min(Math.max(options.batchSize ?? 100, 1), 500);
  const cursor = options.cursor ?? null;
  const dryRun = options.dryRun ?? false;
  const plans = connection.collection('platform_plans');
  const subscriptions = connection.collection('platform_subscriptions');

  const filter: Record<string, unknown> = {
    entitlementSnapshot: { $exists: false },
  };
  if (cursor && Types.ObjectId.isValid(cursor)) {
    filter._id = { $gt: new Types.ObjectId(cursor) };
  }

  const pending = await subscriptions
    .find(filter)
    .project({ _id: 1, planId: 1, period: 1 })
    .sort({ _id: 1 })
    .limit(batchSize)
    .toArray();

  let updated = 0;
  let skippedLegacyPlan = 0;
  for (const subscription of pending) {
    const plan = await plans.findOne({
      _id: subscription.planId,
      contractReady: true,
      entitlementContract: { $exists: true },
    });
    if (!plan) {
      skippedLegacyPlan += 1;
      continue;
    }
    const periodEnd = new Date(subscription.period.end);
    const graceDays = Number(plan.entitlementContract.graceDays ?? 7);
    const snapshot = {
      entitlementSnapshot: plan.entitlementContract,
      planVersion: Number(plan.planVersion ?? 1),
      postExpirationModeSnapshot: plan.postExpirationMode ?? 'read_only',
      ...(plan.fallbackPlanId
        ? { fallbackPlanIdSnapshot: plan.fallbackPlanId }
        : {}),
      graceEndsAt: new Date(periodEnd.getTime() + graceDays * 86_400_000),
      entitlementBackfilledAt: now,
    };
    if (!dryRun) {
      const result = await subscriptions.updateOne(
        { _id: subscription._id, entitlementSnapshot: { $exists: false } },
        { $set: snapshot },
      );
      updated += result.modifiedCount;
    } else {
      updated += 1;
    }
  }

  const last = pending.at(-1);
  const hasMore = pending.length === batchSize;
  return {
    processed: pending.length,
    updated,
    skippedLegacyPlan,
    nextCursor: hasMore && last ? last._id.toString() : null,
    hasMore,
  };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required');
  const batchSize = Number(process.env.BACKFILL_BATCH_SIZE ?? 100);
  const cursor = process.env.BACKFILL_CURSOR ?? null;
  const dryRun = process.env.BACKFILL_DRY_RUN === 'true';
  await mongoose.connect(uri);
  try {
    const result = await backfillPlatformEntitlements(mongoose.connection, {
      batchSize,
      cursor,
      dryRun,
    });
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
