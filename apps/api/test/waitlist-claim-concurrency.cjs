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

const userId = new mongoose.Types.ObjectId();
const ownerId = new mongoose.Types.ObjectId();
const clubId = new mongoose.Types.ObjectId();
const slotId = new mongoose.Types.ObjectId();
const waitlistId = new mongoose.Types.ObjectId();
const entryId = new mongoose.Types.ObjectId();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function tehranDateTomorrow() {
  const tomorrow = new Date(Date.now() + 36 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(tomorrow);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

async function claim(token) {
  const response = await fetch(
    `${base}/account/bookings/waitlist/${waitlistId}/claim`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ entryId: entryId.toString() }),
    },
  );
  return { response, body: await response.json() };
}

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  assert(db, 'Mongo database is unavailable');
  const now = new Date();
  const occurrenceDate = tehranDateTomorrow();
  const offerExpiresAt = new Date(now.getTime() + 10 * 60_000);
  await db.collection('users').insertMany([
    {
      _id: userId,
      phone: `+98912${String(Date.now()).slice(-7)}`,
      roles: ['athlete'],
      activeRole: 'athlete',
      status: 'active',
      name: { first: 'Waitlist', last: 'Athlete' },
      settings: { units: {} },
      favouriteLocations: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: ownerId,
      phone: `+98911${String(Date.now()).slice(-7)}`,
      roles: ['club_owner'],
      activeRole: 'club_owner',
      status: 'active',
      name: { first: 'Waitlist', last: 'Owner' },
      settings: { units: {} },
      favouriteLocations: [],
      createdAt: now,
      updatedAt: now,
    },
  ]);
  await db.collection('clubs').insertOne({
    _id: clubId,
    ownerId,
    identity: { name: 'Waitlist concurrency club' },
    review: { status: 'approved' },
    operationalStatus: 'active',
    calendarRevision: 0,
    createdAt: now,
    updatedAt: now,
  });
  await db.collection('club_slots').insertOne({
    _id: slotId,
    clubId,
    kind: 'session',
    capacity: 1,
    price: 1_000,
    status: 'active',
    calendarRevision: 0,
    schedule: {
      recurrence: {
        type: 'once',
        date: occurrenceDate,
        startTime: '22:00',
        endTime: '23:00',
      },
      exceptions: [],
    },
    createdAt: now,
    updatedAt: now,
  });
  await db.collection('waitlists').insertOne({
    _id: waitlistId,
    clubId,
    resource: { type: 'slot', id: slotId },
    occurrenceDate,
    entries: [
      {
        _id: entryId,
        userId,
        priority: 1,
        status: 'offered',
        joinedAt: now,
        offeredAt: now,
        offerExpiresAt,
      },
    ],
    createdAt: now,
    updatedAt: now,
  });

  const token = jwt.sign(
    {
      sub: userId.toString(),
      phone: '+989120000000',
      roles: ['athlete'],
      activeRole: 'athlete',
    },
    secret,
    { algorithm: 'HS256', expiresIn: '10m' },
  );
  const results = await Promise.all([claim(token), claim(token)]);
  const unexpected = results.filter(({ response }) => !response.ok);
  if (unexpected.length) {
    console.error(
      unexpected.map(({ response, body }) => ({
        status: response.status,
        body,
      })),
    );
  }
  const bookingIds = results.map(({ body }) => body.bookings?.[0]?.id);
  const bookingCount = await db.collection('bookings').countDocuments({
    athleteId: userId,
    idempotencyKey: `waitlist:${entryId}:${occurrenceDate}`,
  });
  const occupancy = await db.collection('club_slot_occupancy').findOne({
    slotId,
    date: occurrenceDate,
  });
  const waitlist = await db.collection('waitlists').findOne({ _id: waitlistId });
  assert(unexpected.length === 0, 'both idempotent claims must succeed');
  assert(bookingIds[0] === bookingIds[1], 'claims returned different bookings');
  assert(bookingCount === 1, `bookingCount=${bookingCount}`);
  assert(occupancy?.reserved === 1, `reserved=${occupancy?.reserved}`);
  assert(waitlist?.entries?.[0]?.status === 'claimed', 'entry was not claimed');
  console.log(
    `PASS waitlist claim concurrency: booking=${bookingIds[0]} reserved=1 replay=same`,
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
      await db.collection('audit_logs').deleteMany({ actorId: userId });
      await db.collection('outbox').deleteMany({
        'payload.athleteId': userId.toString(),
      });
      await db.collection('bookings').deleteMany({ athleteId: userId });
      await db.collection('club_slot_occupancy').deleteMany({ slotId });
      await db.collection('waitlists').deleteOne({ _id: waitlistId });
      await db.collection('club_slots').deleteOne({ _id: slotId });
      await db.collection('clubs').deleteOne({ _id: clubId });
      await db.collection('users').deleteMany({ _id: { $in: [userId, ownerId] } });
    }
    await mongoose.disconnect();
  });
