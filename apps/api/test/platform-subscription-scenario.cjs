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
const oldPlanId = new mongoose.Types.ObjectId();
const newPlanId = new mongoose.Types.ObjectId();
const freePlanId = new mongoose.Types.ObjectId();
const subscriptionId = new mongoose.Types.ObjectId();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, token, body) {
  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return { response, json: await response.json() };
}

function contract(staffLimit) {
  return {
    schemaVersion: 1,
    audience: 'club_owner',
    capabilities: [],
    limits: [{ key: 'staff.active_per_club', value: staffLimit, mode: 'hard' }],
    graceDays: 7,
  };
}

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  assert(db, 'Mongo database is unavailable');
  const now = new Date();
  const start = new Date(now.getTime() - 15 * 86_400_000);
  const end = new Date(now.getTime() + 15 * 86_400_000);
  const oldContract = contract(2);
  const newContract = contract(10);
  const freeContract = contract(1);

  await db.collection('users').insertOne({
    _id: ownerId,
    phone: `+98913${String(Date.now()).slice(-7)}`,
    roles: ['club_owner'],
    status: 'active',
    name: { first: 'Subscription', last: 'Owner' },
    settings: { units: {} },
    favouriteLocations: [],
    createdAt: now,
    updatedAt: now,
    testRunId: runId,
  });
  await db.collection('platform_plans').insertMany([
    {
      _id: oldPlanId,
      code: `old-${runId}`,
      name: 'Old plan',
      pricing: { amount: 1_000_000, tax: 90_000, currency: 'IRT', periodDays: 30 },
      entitlementContract: oldContract,
      features: [],
      planVersion: 1,
      contractReady: true,
      postExpirationMode: 'read_only',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      testRunId: runId,
    },
    {
      _id: newPlanId,
      code: `new-${runId}`,
      name: 'New plan',
      pricing: { amount: 2_000_000, tax: 180_000, currency: 'IRT', periodDays: 30 },
      entitlementContract: newContract,
      features: [],
      planVersion: 3,
      contractReady: true,
      postExpirationMode: 'free_plan',
      fallbackPlanId: freePlanId,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      testRunId: runId,
    },
    {
      _id: freePlanId,
      code: `free-${runId}`,
      name: 'Free plan',
      pricing: { amount: 0, tax: 0, currency: 'IRT', periodDays: 30 },
      entitlementContract: freeContract,
      features: [],
      planVersion: 1,
      contractReady: true,
      postExpirationMode: 'read_only',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      testRunId: runId,
    },
  ]);
  await db.collection('platform_subscriptions').insertOne({
    _id: subscriptionId,
    userId: ownerId,
    planId: oldPlanId,
    currentEntitlementKey: 'current',
    status: 'active',
    period: { start, end },
    renewal: { mode: 'manual' },
    entitlementSnapshot: oldContract,
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
      phone: '+989130000000',
      roles: ['club_owner'],
      activeRole: 'club_owner',
    },
    secret,
    { algorithm: 'HS256', expiresIn: '10m' },
  );
  const preview = await request(
    '/account/platform-subscriptions/checkouts/preview',
    token,
    { planId: newPlanId.toString(), renewalMode: 'manual' },
  );
  assert(preview.response.status === 201, `preview=${preview.response.status}`);
  assert(preview.json.changeKind === 'upgrade', `kind=${preview.json.changeKind}`);
  assert(preview.json.price.credit > 0, `credit=${preview.json.price.credit}`);
  assert(
    preview.json.price.payable ===
      preview.json.price.gross - preview.json.price.credit,
    'payable snapshot drift',
  );

  const initiate = await request(
    '/account/platform-subscriptions/checkouts/initiate',
    token,
    {
      planId: newPlanId.toString(),
      renewalMode: 'manual',
      priceReferenceAt: preview.json.priceReferenceAt,
      idempotencyKey: `platform-upgrade-${runId}`,
      previewFingerprint: preview.json.fingerprint,
      consentVersion: preview.json.consentVersion,
      consentAccepted: true,
      callbackUrl: 'http://localhost:3000/owner/subscription',
    },
  );
  assert(initiate.response.status === 201, `initiate=${initiate.response.status}`);
  const checkoutId = initiate.json.checkoutId;
  const authority = initiate.json.authority;
  assert(checkoutId && authority, 'checkout intent missing');
  await fetch(
    `${base}/payments/mock/complete?authority=${encodeURIComponent(authority)}&outcome=paid`,
    { redirect: 'manual' },
  );
  const verify = await request(
    `/account/platform-subscriptions/checkouts/${checkoutId}/verify`,
    token,
    { authority, status: 'OK' },
  );
  const replay = await request(
    `/account/platform-subscriptions/checkouts/${checkoutId}/verify`,
    token,
    { authority, status: 'OK' },
  );
  assert(verify.response.status === 201, `verify=${verify.response.status}`);
  assert(replay.response.status === 201, `replay=${replay.response.status}`);
  assert(replay.json.idempotent === true, 'verify replay was not idempotent');

  const current = await db.collection('platform_subscriptions').findOne({
    _id: subscriptionId,
  });
  assert(current.planId.equals(newPlanId), 'upgrade did not replace current plan');
  assert(current.planVersion === 3, `planVersion=${current.planVersion}`);
  assert(
    current.entitlementSnapshot.limits[0].value === 10,
    'entitlement snapshot not upgraded',
  );
  const paymentCount = await db.collection('payments').countDocuments({
    'reference.orderId': `platform-subscription-checkout:${checkoutId}`,
    status: 'captured',
  });
  assert(paymentCount === 1, `captured payments=${paymentCount}`);
  const eventCount = await db.collection('outbox_messages').countDocuments({
    eventName: 'platform_subscription.upgraded',
    'payload.checkoutId': checkoutId,
  });
  assert(eventCount === 1, `upgrade events=${eventCount}`);

  const downgrade = await request(
    `/account/platform-subscriptions/${subscriptionId}/plan-change`,
    token,
    { planId: freePlanId.toString() },
  );
  assert(downgrade.response.status === 201, `downgrade=${downgrade.response.status}`);
  assert(
    downgrade.json.scheduledPlanId === freePlanId.toString(),
    'downgrade target not scheduled',
  );
  const cancel = await request(
    `/account/platform-subscriptions/${subscriptionId}/cancel`,
    token,
    { reason: 'integration test' },
  );
  assert(cancel.response.status === 201, `cancel=${cancel.response.status}`);
  assert(cancel.json.status === 'active', 'cancel cut entitlement immediately');
  assert(cancel.json.cancellationRequestedAt, 'cancellation request missing');

  console.log(
    `PASS platform subscription: credit=${preview.json.price.credit} payment=1 event=1 upgrade/replay/downgrade/cancel`,
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
      const checkouts = await db
        .collection('platform_subscription_checkouts')
        .find({ userId: ownerId })
        .toArray();
      const checkoutIds = checkouts.map((row) => row._id.toString());
      const paymentIds = checkouts.map((row) => row.paymentId).filter(Boolean);
      await db.collection('outbox_messages').deleteMany({
        $or: [
          { 'payload.userId': ownerId.toString() },
          { 'payload.checkoutId': { $in: checkoutIds } },
        ],
      });
      await db.collection('ledger_entries').deleteMany({
        'source.refId': { $in: paymentIds.map(String) },
      });
      await db.collection('payments').deleteMany({ _id: { $in: paymentIds } });
      await db
        .collection('platform_subscription_checkouts')
        .deleteMany({ userId: ownerId });
      await db
        .collection('platform_subscriptions')
        .deleteOne({ _id: subscriptionId });
      await db.collection('platform_plans').deleteMany({
        _id: { $in: [oldPlanId, newPlanId, freePlanId] },
      });
      await db.collection('users').deleteOne({ _id: ownerId });
    }
    await mongoose.disconnect();
  });
