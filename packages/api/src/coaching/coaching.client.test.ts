import { createApiClient } from "../client";
import { createAccountCoachingApi } from "./coaching.client";

describe("account coaching leads client", () => {
  it("lists leads and changes stage through the coach-scoped endpoints", async () => {
    const fetchImpl = jest.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === "PATCH") {
        expect(url).toBe(
          "https://api.example/api/v1/account/coaching/leads/lead-1/stage",
        );
        expect(JSON.parse(String(init.body))).toEqual({ stage: "trial" });
        return new Response(
          JSON.stringify({
            id: "lead-1",
            coachUserId: "coach-1",
            contact: { name: "مراجع", phone: null, userId: null },
            stage: "trial",
            notes: null,
            source: null,
            convertedStudentId: null,
            createdAt: "2026-08-26T00:00:00.000Z",
            updatedAt: "2026-08-26T00:00:00.000Z",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      expect(url).toBe(
        "https://api.example/api/v1/account/coaching/leads?page=1&page_size=100&stage=new",
      );
      return new Response(
        JSON.stringify({
          message: "success.generic",
          result: [],
          pagination: { page: 1, page_size: 100, next: null, prev: null, count: 0, total: 0 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    const api = createAccountCoachingApi(
      createApiClient({
        baseUrl: "https://api.example/api/v1",
        fetch: fetchImpl as unknown as typeof fetch,
      }),
    );

    await api.listLeads({ page: 1, page_size: 100, stage: "new" });
    await api.updateLeadStage("lead-1", { stage: "trial" });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
