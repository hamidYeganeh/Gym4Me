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
const coachUserId = new mongoose.Types.ObjectId();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, token, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { response, body: await response.json() };
}

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  assert(db, 'Mongo database is unavailable');
  const now = new Date();
  await db.collection('users').insertOne({
    _id: coachUserId,
    phone: `+98913${String(Date.now()).slice(-7)}`,
    roles: ['coach'],
    activeRole: 'coach',
    status: 'active',
    name: { first: 'Lead', last: 'Coach' },
    settings: { units: {} },
    favouriteLocations: [],
    createdAt: now,
    updatedAt: now,
  });
  const token = jwt.sign(
    {
      sub: coachUserId.toString(),
      phone: '+989130000000',
      roles: ['coach'],
      activeRole: 'coach',
    },
    secret,
    { algorithm: 'HS256', expiresIn: '10m' },
  );
  const input = {
    idempotencyKey: `coach-lead:${coachUserId}`,
    contact: { name: 'مراجع سناریو', phone: '+989121234567' },
    source: 'integration',
    notes: 'پیگیری آزمایشی',
  };
  const [first, replay] = await Promise.all([
    request('/account/coaching/leads', token, 'POST', input),
    request('/account/coaching/leads', token, 'POST', input),
  ]);
  assert(first.response.ok, `first create http=${first.response.status}`);
  assert(replay.response.ok, `replay create http=${replay.response.status}`);
  assert(first.body.id === replay.body.id, 'replay returned another lead');
  const count = await db.collection('coach_leads').countDocuments({
    coachUserId,
    idempotencyKey: input.idempotencyKey,
  });
  assert(count === 1, `lead count=${count}`);
  const moved = await request(
    `/account/coaching/leads/${first.body.id}/stage`,
    token,
    'PATCH',
    { stage: 'trial' },
  );
  assert(moved.response.ok, `stage http=${moved.response.status}`);
  assert(moved.body.stage === 'trial', `stage=${moved.body.stage}`);
  const list = await request(
    '/account/coaching/leads?page=1&page_size=100&stage=trial',
    token,
  );
  assert(list.response.ok, `list http=${list.response.status}`);
  assert(
    list.body.result?.some((lead) => lead.id === first.body.id),
    'trial lead missing from bounded list',
  );
  console.log(
    `PASS coach leads: idempotent=${first.body.id} stage=trial list=bounded`,
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
      await db.collection('coach_leads').deleteMany({ coachUserId });
      await db.collection('audit_logs').deleteMany({ actorId: coachUserId });
      await db.collection('users').deleteOne({ _id: coachUserId });
    }
    await mongoose.disconnect();
  });
