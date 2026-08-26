/**
 * Idempotent phase-two backfill for ADR-0001.
 *
 * It only snapshots plans explicitly marked contractReady. Legacy plans remain
 * on the documented unlimited dual-read path until an admin supplies an
 * audience-safe contract; the command never infers entitlement semantics.
 */
import 'dotenv/config';
import mongoose from 'mongoose';

type BackfillResult = {
  eligible: number;
  updated: number;
  skippedLegacyPlan: number;
};

export async function backfillPlatformEntitlements(
  connection: mongoose.Connection,
  now = new Date(),
): Promise<BackfillResult> {
  const plans = connection.collection('platform_plans');
  const subscriptions = connection.collection('platform_subscriptions');
  const pending = await subscriptions
    .find({ entitlementSnapshot: { $exists: false } })
    .project({ _id: 1, planId: 1, period: 1 })
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
    const result = await subscriptions.updateOne(
      { _id: subscription._id, entitlementSnapshot: { $exists: false } },
      {
        $set: {
          entitlementSnapshot: plan.entitlementContract,
          planVersion: Number(plan.planVersion ?? 1),
          postExpirationModeSnapshot: plan.postExpirationMode ?? 'read_only',
          ...(plan.fallbackPlanId
            ? { fallbackPlanIdSnapshot: plan.fallbackPlanId }
            : {}),
          graceEndsAt: new Date(periodEnd.getTime() + graceDays * 86_400_000),
          entitlementBackfilledAt: now,
        },
      },
    );
    updated += result.modifiedCount;
  }
  return { eligible: pending.length, updated, skippedLegacyPlan };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required');
  await mongoose.connect(uri);
  try {
    const result = await backfillPlatformEntitlements(mongoose.connection);
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
