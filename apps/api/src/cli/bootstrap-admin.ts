import "../config/load-env.js";
import { hash } from "@node-rs/argon2";
import { connectDatabase, disconnectDatabase, registerModels } from "../database/index.js";

const uri = process.env.MONGODB_URI;
const mobile = process.env.BOOTSTRAP_ADMIN_MOBILE;
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
if (!uri) throw new Error("MONGODB_URI is required");
if (!mobile || !/^\+?[1-9]\d{9,14}$/.test(mobile))
  throw new Error("BOOTSTRAP_ADMIN_MOBILE must be a valid E.164 number");
if (!password || password.length < 12)
  throw new Error("BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters");

const models = registerModels(await connectDatabase(uri));
const normalized = mobile.startsWith("+") ? mobile : `+${mobile}`;
const role = await models.Role.findOne({ code: "super_admin", status: "active" });
if (!role) throw new Error("Run db:seed before bootstrapping an admin");
let user = await models.User.findOne({ "contact.mobile.value": normalized });
if (!user) {
  user = await models.User.create({
    contact: { mobile: { value: normalized, verifiedAt: new Date() } },
    status: "active",
  });
  await models.UserProfile.create({
    userId: user._id,
    identity: { displayName: "Gym4Me Admin" },
    status: "active",
  });
}
await models.UserCredential.updateOne(
  { userId: user._id },
  {
    $set: {
      passwordHash: await hash(password),
      passwordSetAt: new Date(),
      passwordChangedAt: new Date(),
      status: "active",
    },
  },
  { upsert: true },
);
await models.RoleAssignment.updateOne(
  { userId: user._id, roleId: role._id, "scope.type": "global", "scope.id": null },
  {
    $setOnInsert: {
      userId: user._id,
      roleId: role._id,
      scope: { type: "global" },
      status: "active",
    },
  },
  { upsert: true },
);
process.stdout.write(`Super Admin ready: ${user._id}\n`);
await disconnectDatabase();
