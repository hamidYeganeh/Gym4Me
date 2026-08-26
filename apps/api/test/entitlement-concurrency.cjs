/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const mongoUri =
  process.env.MONGODB_URI ??
  'mongodb://127.0.0.1:27018/gym4me?replicaSet=rs0&directConnection=true';
const base = process.env.API_URL ?? 'http://127.0.0.1:8088/api/v1';
const secret = process.env.JWT_ACCESS_SECRET;
if (!secret) throw new Error('JWT_ACCESS_SECRET is required');

const runId = `${Date.now()}-${process.pid}`;
const ownerId = new mongoose.Types.ObjectId();
const clubId = new mongoose.Types.ObjectId();
const planId = new mongoose.Types.ObjectId();
const subscriptionId = new mongoose.Types.ObjectId();
const staffIds = Array.from({ length: 20 }, () => new mongoose.Types.ObjectId());
const limit = 3;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function invite(token, userId) {
  const response = await fetch(`${base}/account/clubs/${clubId}/staff`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ userId: userId.toString(), preset: 'reception' }),
  });
  return { response, json: await response.json() };
}

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  assert(db, 'Mongo database is unavailable');
  const now = new Date();
  const end = new Date(now.getTime() + 30 * 86_400_000);
  const entitlement = {
    schemaVersion: 1,
    audience: 'club_owner',
    capabilities: [],
    limits: [{ key: 'staff.active_per_club', value: limit, mode: 'hard' }],
    graceDays: 7,
  };

  await db.collection('users').insertMany([
    {
      _id: ownerId,
      phone: `+98911${String(Date.now()).slice(-7)}`,
      roles: ['club_owner'],
      activeRole: 'club_owner',
      status: 'active',
      name: { first: 'Entitlement', last: 'Owner' },
      settings: { units: {} },
      favouriteLocations: [],
      createdAt: now,
      updatedAt: now,
      testRunId: runId,
    },
    ...staffIds.map((id, index) => ({
      _id: id,
      phone: `+98912${String(8_000_000 + index).slice(-7)}`,
      roles: ['athlete'],
      status: 'active',
      name: { first: 'Staff', last: String(index) },
      settings: { units: {} },
      favouriteLocations: [],
      createdAt: now,
      updatedAt: now,
      testRunId: runId,
    })),
  ]);
  await db.collection('clubs').insertOne({
    _id: clubId,
    ownerId,
    identity: { name: `Entitlement ${runId}` },
    review: { status: 'approved' },
    operationalStatus: 'active',
    createdAt: now,
    updatedAt: now,
    testRunId: runId,
  });
  await db.collection('platform_plans').insertOne({
    _id: planId,
    code: `entitlement-${runId}`,
    name: 'Concurrency plan',
    pricing: { amount: 0, currency: 'IRT', periodDays: 30 },
    features: [],
    entitlementContract: entitlement,
    planVersion: 1,
    contractReady: true,
    postExpirationMode: 'read_only',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    testRunId: runId,
  });
  await db.collection('platform_subscriptions').insertOne({
    _id: subscriptionId,
    userId: ownerId,
    planId,
    currentEntitlementKey: 'current',
    status: 'active',
    period: { start: now, end },
    renewal: { mode: 'manual' },
    entitlementSnapshot: entitlement,
    planVersion: 1,
    postExpirationModeSnapshot: 'read_only',
    graceEndsAt: new Date(end.getTime() + 7 * 86_400_000),
    createdAt: now,
    updatedAt: now,
    testRunId: runId,
  });

  const token = jwt.sign(
    {
      sub: ownerId.toString(),
      phone: '+989110000000',
      roles: ['club_owner'],
      activeRole: 'club_owner',
    },
    secret,
    { algorithm: 'HS256', expiresIn: '10m' },
  );
  const results = await Promise.all(staffIds.map((id) => invite(token, id)));
  const winners = results.filter(({ response }) => response.status === 201);
  const denied = results.filter(({ response }) => response.status === 403);
  const unexpected = results.filter(
    ({ response }) => response.status !== 201 && response.status !== 403,
  );
  if (unexpected.length) {
    console.error(
      unexpected.slice(0, 5).map(({ response, json }) => ({
        status: response.status,
        json,
      })),
    );
  }
  const active = await db.collection('club_staff').countDocuments({
    clubId,
    status: 'active',
  });
  assert(winners.length === limit, `winners=${winners.length}`);
  assert(denied.length === staffIds.length - limit, `denied=${denied.length}`);
  assert(unexpected.length === 0, `unexpected=${unexpected.length}`);
  assert(active === limit, `active=${active}`);
  console.log(
    `PASS entitlement concurrency: winners=${winners.length} denied=${denied.length} active=${active}`,
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
      await db.collection('club_staff').deleteMany({ clubId });
      await db.collection('platform_entitlement_boundaries').deleteMany({
        _id: { $regex: `^${ownerId.toString()}:` },
      });
      await db.collection('platform_subscriptions').deleteOne({
        _id: subscriptionId,
      });
      await db.collection('platform_plans').deleteOne({ _id: planId });
      await db.collection('clubs').deleteOne({ _id: clubId });
      await db.collection('users').deleteMany({
        _id: { $in: [ownerId, ...staffIds] },
      });
    }
    await mongoose.disconnect();
  });
