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

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  if (!db) throw new Error('Mongo database is unavailable');
  const userId = new mongoose.Types.ObjectId();
  const waitlistId = new mongoose.Types.ObjectId();
  const entryId = new mongoose.Types.ObjectId();
  const resourceId = new mongoose.Types.ObjectId();
  const now = new Date();
  const offerExpiresAt = new Date(now.getTime() + 10 * 60_000);

  await db.collection('users').insertOne({
    _id: userId,
    phone: '+989120000000',
    roles: ['athlete'],
    activeRole: 'athlete',
    status: 'active',
    name: { first: 'Action', last: 'Center' },
    settings: { units: {} },
    favouriteLocations: [],
    createdAt: now,
    updatedAt: now,
  });
  await db.collection('waitlists').insertOne({
    _id: waitlistId,
    resource: { type: 'slot', id: resourceId },
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

  try {
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
    const response = await fetch(`${base}/account/action-center`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const body = await response.json();
    if (!response.ok) throw new Error(`action center http=${response.status}`);
    if (!Array.isArray(body.items) || body.items.length > 3) {
      throw new Error('Action Center result is not bounded');
    }
    const offer = body.items.find(
      (item) => item.kind === 'athlete.waitlist_offer',
    );
    if (!offer || offer.entityId !== waitlistId.toString()) {
      throw new Error('Active waitlist offer was not projected');
    }
    if (offer.dueAt !== offerExpiresAt.toISOString()) {
      throw new Error('Waitlist offer expiry drifted');
    }
    console.log('PASS action center: bounded waitlist recovery offer');
  } finally {
    await db.collection('waitlists').deleteOne({ _id: waitlistId });
    await db.collection('users').deleteOne({ _id: userId });
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
