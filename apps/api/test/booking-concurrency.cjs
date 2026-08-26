/* eslint-disable no-console */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const mongoUri =
  process.env.MONGODB_URI ??
  'mongodb://127.0.0.1:27018/gym4me_ci?replicaSet=rs0&directConnection=true';
const base = process.env.API_URL ?? 'http://127.0.0.1:8088/api/v1';
const secret = process.env.JWT_ACCESS_SECRET;

if (!secret) throw new Error('JWT_ACCESS_SECRET is required');

const runId = `${Date.now()}-${process.pid}`;
const athleteIds = Array.from(
  { length: 50 },
  () => new mongoose.Types.ObjectId(),
);
const clubId = new mongoose.Types.ObjectId();
const ownerId = new mongoose.Types.ObjectId();
const slotId = new mongoose.Types.ObjectId();
const occurrence = new Date(Date.now() + 7 * 86_400_000)
  .toISOString()
  .slice(0, 10);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function reserve(athleteId, index, overrides = {}) {
  const phone = `+98910${String(900_000 + index).slice(-6)}`;
  const token = jwt.sign(
    {
      sub: athleteId.toString(),
      phone,
      roles: ['athlete'],
      activeRole: 'athlete',
    },
    secret,
    { algorithm: 'HS256', expiresIn: '10m' },
  );
  const body = {
    clubId: clubId.toString(),
    slotId: slotId.toString(),
    dates: [occurrence],
    attendeeCount: 1,
    idempotencyKey: `g4m030-${runId}-${index}`,
    ...overrides,
  };
  const response = await fetch(`${base}/account/bookings/club`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return { response, body, json: await response.json() };
}

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  assert(db, 'Mongo database is unavailable');

  await db.collection('users').insertMany(
    athleteIds.map((id, index) => ({
      _id: id,
      phone: `+98910${String(900_000 + index).slice(-6)}`,
      phoneVerifiedAt: new Date(),
      roles: ['athlete'],
      status: 'active',
      kycStatus: 'none',
      name: { first: 'Concurrency', last: String(index) },
      settings: { units: {} },
      favouriteLocations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      testRunId: runId,
    })),
    { writeConcern: { w: 'majority' } },
  );
  await db.collection('clubs').insertOne(
    {
      _id: clubId,
      ownerId,
      identity: { name: `G4M030 ${runId}` },
      operationalStatus: 'active',
      calendarRevision: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      testRunId: runId,
    },
    { writeConcern: { w: 'majority' } },
  );
  await db.collection('club_slots').insertOne(
    {
      _id: slotId,
      clubId,
      kind: 'session',
      capacity: 17,
      price: 0,
      schedule: {
        recurrence: {
          type: 'once',
          date: occurrence,
          startTime: '20:00',
          endTime: '21:00',
        },
        exceptions: [],
      },
      status: 'active',
      calendarRevision: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      testRunId: runId,
    },
    { writeConcern: { w: 'majority' } },
  );

  const results = await Promise.all(
    athleteIds.map((athleteId, index) => reserve(athleteId, index)),
  );
  const winners = results.filter(({ response }) => response.status === 201);
  const conflicts = results.filter(({ response }) => response.status === 409);
  const unexpected = results.filter(
    ({ response }) => response.status !== 201 && response.status !== 409,
  );
  console.log(
    `G4M030 responses: winners=${winners.length} conflicts=${conflicts.length} unexpected=${unexpected.length}`,
  );
  if (unexpected.length) {
    console.error(
      'Unexpected responses:',
      unexpected.slice(0, 5).map(({ response, json }) => ({
        status: response.status,
        body: json,
      })),
    );
  }
  assert(winners.length === 17, `expected 17 winners, got ${winners.length}`);
  assert(
    conflicts.length === 33,
    `expected 33 conflicts, got ${conflicts.length}`,
  );

  const occupancy = await db
    .collection('club_slot_occupancy')
    .findOne({ slotId, date: occurrence });
  assert(occupancy?.reserved === 17, `reserved=${occupancy?.reserved}`);
  const bookingCount = await db.collection('bookings').countDocuments({
    'resource.refId': slotId,
    'occurrence.date': occurrence,
  });
  assert(bookingCount === 17, `bookingCount=${bookingCount}`);

  const winnerIndex = results.findIndex(
    ({ response }) => response.status === 201,
  );
  const replay = await reserve(athleteIds[winnerIndex], winnerIndex);
  assert(
    replay.response.status === 201,
    `replay status=${replay.response.status}`,
  );
  assert(
    replay.json.bookings?.[0]?.id ===
      results[winnerIndex].json.bookings?.[0]?.id,
    'idempotent replay returned a different booking',
  );
  const drift = await reserve(athleteIds[winnerIndex], winnerIndex, {
    attendeeCount: 2,
  });
  assert(
    drift.response.status === 409,
    `payload drift status=${drift.response.status}`,
  );

  console.log(
    `PASS G4M030 concurrency: winners=${winners.length} conflicts=${conflicts.length} reserved=${occupancy.reserved}`,
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
      await db.collection('outbox_messages').deleteMany({
        'payload.bookingId': {
          $in: await db
            .collection('bookings')
            .find({ 'resource.refId': slotId })
            .map((row) => row._id.toString())
            .toArray(),
        },
      });
      await db.collection('bookings').deleteMany({ 'resource.refId': slotId });
      await db.collection('club_slot_occupancy').deleteMany({ slotId });
      await db.collection('club_slots').deleteOne({ _id: slotId });
      await db.collection('clubs').deleteOne({ _id: clubId });
      await db.collection('users').deleteMany({ _id: { $in: athleteIds } });
    }
    await mongoose.disconnect();
  });
