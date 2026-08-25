import { createApiClient } from "../client";
import { createAccountProgressApi } from "./progress.client";

describe("workout execution client contract", () => {
  it("uses dedicated authoritative complete and skip transitions", async () => {
    const fetchImpl = jest.fn().mockImplementation(async () =>
      new Response(JSON.stringify({ id: "log-a" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createApiClient({
      baseUrl: "https://api.example/api/v1",
      fetch: fetchImpl as unknown as typeof fetch,
    });
    const progress = createAccountProgressApi(client);

    await progress.completeWorkoutLog("log-a");
    await progress.skipWorkoutLog("log-b");
    await progress.getWorkoutPlanRevision("plan-a", "revision-a");
    await progress.reviewWorkoutLog("log-c", {
      note: "Keep your back neutral.",
      clientMutationId: "mutation-review-0001",
    });

    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
      "https://api.example/api/v1/account/progress/workout-logs/log-a/complete",
      "https://api.example/api/v1/account/progress/workout-logs/log-b/skip",
      "https://api.example/api/v1/account/progress/workout-plans/plan-a/revisions/revision-a",
      "https://api.example/api/v1/account/progress/workout-logs/log-c/reviews",
    ]);
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({ method: "POST" }),
    );
  });
});
