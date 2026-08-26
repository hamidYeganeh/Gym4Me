import mongoose, { Types } from 'mongoose';
import { backfillPlatformEntitlements } from './backfill-platform-entitlements';

const mongoUri =
  process.env.MONGODB_URI ??
  'mongodb://127.0.0.1:27018/gym4me?replicaSet=rs0&directConnection=true';

describe('backfillPlatformEntitlements', () => {
  let connection: mongoose.Connection | undefined;
  let mongoReady = false;

  beforeAll(async () => {
    try {
      connection = mongoose.createConnection(mongoUri, {
        serverSelectionTimeoutMS: 4000,
      });
      await connection.asPromise();
      mongoReady = true;
    } catch {
      mongoReady = false;
      connection = undefined;
    }
  }, 15000);

  afterAll(async () => {
    await connection?.close();
  });

  it('backfills contract-ready subscriptions in bounded batches', async () => {
    if (!mongoReady || !connection) {
      return;
    }
    const runId = new Types.ObjectId().toString();
    const planId = new Types.ObjectId();
    const legacyPlanId = new Types.ObjectId();
    const subscriptionIds = Array.from({ length: 3 }, () => new Types.ObjectId());
    const now = new Date('2026-08-27T00:00:00.000Z');
    const periodEnd = new Date('2026-09-27T00:00:00.000Z');
    const contract = {
      schemaVersion: 1,
      audience: 'club_owner',
      capabilities: [],
      limits: [{ key: 'clubs.active', value: 1, mode: 'hard' }],
      graceDays: 7,
    };

    await connection.collection('platform_plans').insertMany([
      {
        _id: planId,
        code: `ready-${runId}`,
        name: 'Ready',
        pricing: { amount: 100, currency: 'IRT', periodDays: 30 },
        contractReady: true,
        entitlementContract: contract,
        planVersion: 1,
        status: 'active',
        features: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: legacyPlanId,
        code: `legacy-${runId}`,
        name: 'Legacy',
        pricing: { amount: 0, currency: 'IRT', periodDays: 30 },
        contractReady: false,
        status: 'active',
        features: [],
        createdAt: now,
        updatedAt: now,
      },
    ]);
    await connection.collection('platform_subscriptions').insertMany(
      subscriptionIds.map((id, index) => ({
        _id: id,
        userId: new Types.ObjectId(),
        planId: index === 2 ? legacyPlanId : planId,
        currentEntitlementKey: 'current',
        status: 'active',
        period: { start: now, end: periodEnd },
        createdAt: now,
        updatedAt: now,
        testRunId: runId,
      })),
    );

    const first = await backfillPlatformEntitlements(connection, {
      batchSize: 2,
      cursor: null,
    }, now);
    expect(first.processed).toBe(2);
    expect(first.updated).toBeGreaterThanOrEqual(1);
    expect(first.hasMore).toBe(true);
    expect(first.nextCursor).toBeTruthy();

    const second = await backfillPlatformEntitlements(connection, {
      batchSize: 2,
      cursor: first.nextCursor,
    }, now);
    expect(second.processed).toBeGreaterThanOrEqual(1);
    expect(second.hasMore).toBe(false);

    const readyCount = await connection.collection('platform_subscriptions').countDocuments({
      testRunId: runId,
      entitlementSnapshot: { $exists: true },
    });
    expect(readyCount).toBe(2);

    await connection.collection('platform_subscriptions').deleteMany({ testRunId: runId });
    await connection.collection('platform_plans').deleteMany({
      code: { $in: [`ready-${runId}`, `legacy-${runId}`] },
    });
  });
});
