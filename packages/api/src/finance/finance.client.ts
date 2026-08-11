import type { ApiClient } from "../client";
import type {
  AnalyticsPeriod,
  Invoice,
  InvoicesPage,
  IssueInvoiceFromPaymentInput,
  ListInvoicesQuery,
  OwnerFinanceAnalytics,
  WalletOverview,
} from "./finance.dto";
import { accountFinanceEndpoints as ep } from "./finance.endpoint";

export function createAccountFinanceApi(client: ApiClient) {
  return {
    walletOverview() {
      return client.request<WalletOverview>(ep.walletOverview);
    },

    listInvoices(query: ListInvoicesQuery = {}) {
      return client.request<InvoicesPage>(ep.invoices, { query });
    },

    getInvoice(id: string) {
      return client.request<Invoice>(ep.invoice(id));
    },

    issueInvoiceFromPayment(input: IssueInvoiceFromPaymentInput) {
      return client.request<Invoice>(ep.invoiceFromPayment, {
        method: "POST",
        body: input,
      });
    },

    ownerAnalytics(clubId: string, period?: AnalyticsPeriod) {
      return client.request<OwnerFinanceAnalytics>(ep.ownerAnalytics(clubId), {
        query: period ? { period } : undefined,
      });
    },
  };
}

export type AccountFinanceApi = ReturnType<typeof createAccountFinanceApi>;
