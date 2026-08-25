const stored = { value: null as string | null };

jest.mock("./offline-queue.storage", () => ({
  offlineQueueStorage: {
    loadJson: jest.fn(async () => stored.value),
    saveJson: jest.fn(async (value: string) => {
      stored.value = value;
    }),
    clear: jest.fn(async () => {
      stored.value = null;
    }),
  },
}));

const api = {
  createWorkoutLog: jest.fn(),
  updateWorkoutLog: jest.fn(),
  completeWorkoutLog: jest.fn(),
  skipWorkoutLog: jest.fn(),
  syncMetrics: jest.fn(),
};

jest.mock("@/shared/lib/api", () => ({ accountProgress: api }));

import {
  clearOfflineQueue,
  enqueueWorkoutOperation,
  flush,
  listPendingWorkoutOperations,
  retryWorkoutOperations,
  discardWorkoutOperations,
} from "./offline-queue";

describe("offline workout queue", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearOfflineQueue();
  });

  it("replays create, update and terminal transition in order", async () => {
    api.createWorkoutLog.mockResolvedValue({ id: "server-log-1" });
    api.updateWorkoutLog.mockResolvedValue({ id: "server-log-1" });
    api.completeWorkoutLog.mockResolvedValue({ id: "server-log-1" });

    await enqueueWorkoutOperation({
      operation: "create",
      localLogId: "offline-log-1",
      input: {
        planId: "plan-1",
        sessionIndex: 1,
        status: "draft",
        clientMutationId: "workout-mutation-0001",
      },
    });
    await enqueueWorkoutOperation({
      operation: "update",
      planId: "plan-1",
      localLogId: "offline-log-1",
      input: { status: "in_progress", sets: [] },
    });
    await enqueueWorkoutOperation({
      operation: "complete",
      planId: "plan-1",
      localLogId: "offline-log-1",
    });

    await flush();

    expect(api.createWorkoutLog).toHaveBeenCalledTimes(1);
    expect(api.updateWorkoutLog).toHaveBeenCalledWith("server-log-1", {
      status: "in_progress",
      sets: [],
    });
    expect(api.completeWorkoutLog).toHaveBeenCalledWith("server-log-1");
    expect(api.createWorkoutLog.mock.invocationCallOrder[0]).toBeLessThan(
      api.updateWorkoutLog.mock.invocationCallOrder[0]!,
    );
    expect(api.updateWorkoutLog.mock.invocationCallOrder[0]).toBeLessThan(
      api.completeWorkoutLog.mock.invocationCallOrder[0]!,
    );
    await expect(listPendingWorkoutOperations("plan-1")).resolves.toEqual([]);
  });

  it("keeps a network failure retryable without executing dependants", async () => {
    api.createWorkoutLog.mockRejectedValue(new TypeError("Failed to fetch"));
    await enqueueWorkoutOperation({
      operation: "create",
      localLogId: "offline-log-2",
      input: {
        planId: "plan-2",
        sessionIndex: 1,
        status: "draft",
        clientMutationId: "workout-mutation-0002",
      },
    });
    await enqueueWorkoutOperation({
      operation: "complete",
      planId: "plan-2",
      localLogId: "offline-log-2",
    });

    await flush();

    const pending = await listPendingWorkoutOperations("plan-2");
    expect(pending.map((item) => item.status)).toEqual([
      "retryable_error",
      "retryable_error",
    ]);
    expect(api.completeWorkoutLog).not.toHaveBeenCalled();

    api.createWorkoutLog.mockResolvedValue({ id: "server-log-2" });
    api.completeWorkoutLog.mockResolvedValue({ id: "server-log-2" });
    await retryWorkoutOperations("offline-log-2");
    await flush();
    await expect(listPendingWorkoutOperations("plan-2")).resolves.toEqual([]);
  });

  it("lets the athlete explicitly discard unresolved local mutations", async () => {
    await enqueueWorkoutOperation({
      operation: "create",
      localLogId: "offline-log-3",
      input: {
        planId: "plan-3",
        sessionIndex: 1,
        status: "draft",
        clientMutationId: "workout-mutation-0003",
      },
    });
    await discardWorkoutOperations("offline-log-3");
    await expect(listPendingWorkoutOperations("plan-3")).resolves.toEqual([]);
  });
});
