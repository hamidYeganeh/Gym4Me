import { createServer, type Server } from "node:http";
import mongoose from "mongoose";

export type WorkerState = {
  startedAt: number;
  shuttingDown: boolean;
  lastLoopAt: number;
  lastMaintenanceAt: number;
  outboxProcessed: number;
  notificationsProcessed: number;
  reconciliationRuns: number;
  loopErrors: number;
};

const metrics = (state: WorkerState) =>
  `# HELP gym4me_worker_uptime_seconds Worker uptime.\n# TYPE gym4me_worker_uptime_seconds gauge\ngym4me_worker_uptime_seconds ${(Date.now() - state.startedAt) / 1000}\n# HELP gym4me_worker_outbox_processed_total Processed outbox events.\n# TYPE gym4me_worker_outbox_processed_total counter\ngym4me_worker_outbox_processed_total ${state.outboxProcessed}\n# HELP gym4me_worker_notifications_processed_total Processed notification jobs.\n# TYPE gym4me_worker_notifications_processed_total counter\ngym4me_worker_notifications_processed_total ${state.notificationsProcessed}\n# HELP gym4me_worker_reconciliation_runs_total Kavenegar reconciliation runs.\n# TYPE gym4me_worker_reconciliation_runs_total counter\ngym4me_worker_reconciliation_runs_total ${state.reconciliationRuns}\n# HELP gym4me_worker_loop_errors_total Worker loop errors.\n# TYPE gym4me_worker_loop_errors_total counter\ngym4me_worker_loop_errors_total ${state.loopErrors}\n# HELP process_resident_memory_bytes Resident memory size.\n# TYPE process_resident_memory_bytes gauge\nprocess_resident_memory_bytes ${process.memoryUsage().rss}\n`;

export function startHealthServer(state: WorkerState): Server {
  const port = Number(process.env.WORKER_HEALTH_PORT ?? 4001);
  const host = process.env.WORKER_HEALTH_HOST ?? "0.0.0.0";
  const server = createServer(async (request, response) => {
    if (request.url === "/health/live") {
      const healthy = !state.shuttingDown && Date.now() - state.lastLoopAt < 30_000;
      response.writeHead(healthy ? 200 : 503, { "content-type": "application/json" });
      response.end(
        JSON.stringify({ status: healthy ? "ok" : "unhealthy", service: "gym4me-worker" }),
      );
      return;
    }
    if (request.url === "/health/ready") {
      try {
        if (mongoose.connection.readyState !== 1 || !mongoose.connection.db)
          throw new Error("MongoDB is not ready");
        await mongoose.connection.db.admin().ping();
        response.writeHead(state.shuttingDown ? 503 : 200, { "content-type": "application/json" });
        response.end(
          JSON.stringify({
            status: state.shuttingDown ? "shutting_down" : "ready",
            service: "gym4me-worker",
          }),
        );
      } catch {
        response.writeHead(503, { "content-type": "application/json" });
        response.end(JSON.stringify({ status: "unavailable", service: "gym4me-worker" }));
      }
      return;
    }
    if (request.url === "/metrics") {
      const token = process.env.METRICS_TOKEN;
      if (token && request.headers.authorization !== `Bearer ${token}`) {
        response.writeHead(401).end();
        return;
      }
      response.writeHead(200, { "content-type": "text/plain; version=0.0.4; charset=utf-8" });
      response.end(metrics(state));
      return;
    }
    response.writeHead(404).end();
  });
  server.listen(port, host);
  return server;
}
