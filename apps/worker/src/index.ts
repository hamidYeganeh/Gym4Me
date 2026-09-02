import "./load-env.js";
import { connectDatabase, disconnectDatabase, registerModels } from "backend/database";
import {
  ensureNotificationTemplates,
  processNotificationJob,
  reconcileKavenegarDeliveries,
  routeOutboxEvent,
} from "./notification-dispatcher.js";
import { runMaintenance } from "./maintenance.js";
import { startHealthServer, type WorkerState } from "./health-server.js";
import { assertPushConfiguration } from "./push-provider.js";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required");
if (process.env.NODE_ENV === "production") {
  if (!process.env.METRICS_TOKEN) throw new Error("METRICS_TOKEN is required in production");
  if (process.env.NOTIFICATION_PROVIDER !== "kavenegar" || !process.env.KAVENEGAR_API_KEY)
    throw new Error("Kavenegar must be configured in production");
  if (!["direct", "webhook"].includes(process.env.PUSH_PROVIDER ?? ""))
    throw new Error("A production push provider is required");
  assertPushConfiguration();
}
const models = registerModels(await connectDatabase(uri));
let shuttingDown = false;
let nextMaintenanceAt = 0;
const state: WorkerState = {
  startedAt: Date.now(),
  shuttingDown: false,
  lastLoopAt: Date.now(),
  lastMaintenanceAt: 0,
  outboxProcessed: 0,
  notificationsProcessed: 0,
  reconciliationRuns: 0,
  loopErrors: 0,
};
const healthServer = startHealthServer(state);
const requestShutdown = () => {
  shuttingDown = true;
  state.shuttingDown = true;
};
process.once("SIGINT", requestShutdown);
process.once("SIGTERM", requestShutdown);

await ensureNotificationTemplates(models);

async function processOne() {
  const now = new Date();
  const event = await models.OutboxEvent.findOneAndUpdate(
    {
      status: "pending",
      availableAt: { $lte: now },
      $or: [{ "processing.lockedUntil": null }, { "processing.lockedUntil": { $lt: now } }],
    },
    {
      $set: {
        status: "processing",
        "processing.lockedAt": now,
        "processing.lockedUntil": new Date(now.getTime() + 30_000),
      },
      $inc: { "processing.attempts": 1 },
    },
    { sort: { createdAt: 1 }, returnDocument: "after" },
  );
  if (!event) return false;
  try {
    await routeOutboxEvent(models, event.toObject());
    await event.updateOne({
      $set: {
        status: "processed",
        "processing.processedAt": new Date(),
        "processing.lastError": null,
      },
    });
  } catch (error) {
    await event.updateOne({
      $set: {
        status: "pending",
        availableAt: new Date(Date.now() + 30_000),
        "processing.lastError": error instanceof Error ? error.message : "Unknown worker error",
        "processing.lockedUntil": null,
      },
    });
  }
  return true;
}

while (!shuttingDown) {
  state.lastLoopAt = Date.now();
  try {
    if (Date.now() >= nextMaintenanceAt) {
      await runMaintenance(models);
      state.lastMaintenanceAt = Date.now();
      nextMaintenanceAt = Date.now() + 15_000;
    }
    if (await processOne()) state.outboxProcessed += 1;
    else if (await processNotificationJob(models)) state.notificationsProcessed += 1;
    else if (await reconcileKavenegarDeliveries(models)) state.reconciliationRuns += 1;
    else await new Promise((resolve) => setTimeout(resolve, 2_000));
  } catch (error) {
    state.loopErrors += 1;
    process.stderr.write(
      `${JSON.stringify({ level: "error", service: "gym4me-worker", message: error instanceof Error ? error.message : "Unknown worker loop error", at: new Date().toISOString() })}\n`,
    );
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
}
await new Promise<void>((resolve) => healthServer.close(() => resolve()));
await disconnectDatabase();
