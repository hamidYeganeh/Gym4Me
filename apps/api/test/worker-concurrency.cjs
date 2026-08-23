/* eslint-disable no-console */
const mongoose = require('mongoose');

const mongoUri =
  process.env.MONGODB_URI ??
  'mongodb://127.0.0.1:27018/gym4me_ci?replicaSet=rs0&directConnection=true';
const runId = `${Date.now()}-${process.pid}`;
const leaseKey = `g4m040.integration.${runId}`;
const outboxId = new mongoose.Types.ObjectId();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function acquireLease(collection, ownerId) {
  const now = new Date();
  return collection.findOneAndUpdate(
    {
      key: leaseKey,
      $or: [{ leaseUntil: { $lte: now } }, { leaseUntil: { $exists: false } }],
    },
    {
      $setOnInsert: { key: leaseKey, createdAt: now },
      $set: {
        ownerId,
        acquiredAt: now,
        heartbeatAt: now,
        leaseUntil: new Date(now.getTime() + 60_000),
        updatedAt: now,
      },
      $inc: { runCount: 1 },
    },
    { upsert: true, returnDocument: 'after' },
  );
}

async function claimOutbox(collection, ownerId) {
  const now = new Date();
  return collection.findOneAndUpdate(
    {
      _id: outboxId,
      $or: [
        {
          status: 'pending',
          $or: [
            { nextAttemptAt: { $lte: now } },
            { nextAttemptAt: { $exists: false } },
          ],
        },
        {
          status: 'processing',
          $or: [
            { leaseUntil: { $lte: now } },
            { leaseUntil: { $exists: false } },
          ],
        },
      ],
    },
    {
      $set: {
        status: 'processing',
        claimedBy: ownerId,
        heartbeatAt: now,
        leaseUntil: new Date(now.getTime() + 60_000),
        updatedAt: now,
      },
      $inc: { attempts: 1 },
    },
    { returnDocument: 'after' },
  );
}

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  assert(db, 'Mongo database is unavailable');
  const leases = db.collection('worker_leases');
  const outbox = db.collection('outbox_messages');

  await leases.createIndex({ key: 1 }, { unique: true });
  const leaseRace = await Promise.allSettled(
    Array.from({ length: 20 }, (_, index) =>
      acquireLease(leases, `instance-${index}`),
    ),
  );
  const leaseWinners = leaseRace.filter(
    (result) => result.status === 'fulfilled' && result.value,
  );
  assert(
    leaseWinners.length === 1,
    `expected one lease winner, got ${leaseWinners.length}`,
  );

  await leases.updateOne(
    { key: leaseKey },
    { $set: { leaseUntil: new Date(Date.now() - 1_000) } },
  );
  const reclaimed = await acquireLease(leases, 'recovery-instance');
  assert(
    reclaimed?.ownerId === 'recovery-instance',
    'expired worker lease was not reclaimed',
  );

  const now = new Date();
  await outbox.insertOne({
    _id: outboxId,
    eventName: 'g4m040.integration',
    payload: {},
    status: 'pending',
    attempts: 0,
    replayCount: 0,
    nextAttemptAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const claimRace = await Promise.all(
    Array.from({ length: 20 }, (_, index) =>
      claimOutbox(outbox, `outbox-instance-${index}`),
    ),
  );
  assert(
    claimRace.filter(Boolean).length === 1,
    `expected one outbox claimant, got ${claimRace.filter(Boolean).length}`,
  );

  await outbox.updateOne(
    { _id: outboxId },
    { $set: { leaseUntil: new Date(Date.now() - 1_000) } },
  );
  const recoveryRace = await Promise.all(
    Array.from({ length: 20 }, (_, index) =>
      claimOutbox(outbox, `recovery-outbox-${index}`),
    ),
  );
  assert(
    recoveryRace.filter(Boolean).length === 1,
    `expected one stale outbox claimant, got ${recoveryRace.filter(Boolean).length}`,
  );
  const recovered = recoveryRace.find(Boolean);
  assert(
    recovered?.attempts === 2,
    `expected attempts=2, got ${recovered?.attempts}`,
  );

  await outbox.updateOne(
    { _id: outboxId },
    {
      $set: { status: 'dead_letter', deadLetteredAt: new Date() },
      $unset: { claimedBy: 1, leaseUntil: 1, heartbeatAt: 1 },
    },
  );
  assert(
    (await claimOutbox(outbox, 'poison-retry')) === null,
    'dead-letter message was claimed again',
  );

  console.log(
    'PASS G4M040 distributed workers: one lease winner, stale recovery, one outbox claimant, poison stopped',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const db = mongoose.connection.db;
    if (db) {
      await db.collection('worker_leases').deleteOne({ key: leaseKey });
      await db.collection('outbox_messages').deleteOne({ _id: outboxId });
    }
    await mongoose.disconnect();
  });
