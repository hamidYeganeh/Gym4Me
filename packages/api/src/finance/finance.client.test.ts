import type { ApiClient } from "../client";
import { createAccountFinanceApi } from "./finance.client";

describe("owner finance invoice client", () => {
  it("keeps invoice listing club-scoped", async () => {
    const request = jest.fn().mockResolvedValue({});
    const api = createAccountFinanceApi({ request } as unknown as ApiClient);

    await api.listClubInvoices("club-1", { page: 2, page_size: 50 });

    expect(request).toHaveBeenCalledWith(
      "/account/clubs/club-1/finance/invoices",
      { query: { page: 2, page_size: 50 } },
    );
  });
});
