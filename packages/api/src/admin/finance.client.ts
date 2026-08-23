import type { ApiClient } from "../client";
import { adminFinanceEndpoints as ep } from "./finance.endpoint";
import type {
  AdminLedgerEntry,
  AdminLedgerPage,
  CreatePayoutInput,
  DraftPeriodPayoutInput,
  ListAdminLedgerQuery,
  ListAdminPaymentsQuery,
  ListPayoutsQuery,
  PaymentsPage,
  PaymentWithLedger,
  Payout,
  PayoutsPage,
  ResolvePayoutDisputeInput,
  RebuildWalletInput,
  RebuildWalletResult,
  SettlePayoutInput,
} from "./finance.dto";

function normalizeLedgerEntry(
  raw: AdminLedgerEntry & { _id?: string },
): AdminLedgerEntry {
  return {
    ...raw,
    id: raw.id || String(raw._id ?? ""),
    paymentId: raw.paymentId ? String(raw.paymentId) : null,
    occurredAt:
      typeof raw.occurredAt === "string"
        ? raw.occurredAt
        : new Date(String(raw.occurredAt)).toISOString(),
  };
}

/** Admin finance ops: immutable ledger, payments, payouts. */
export function createAdminFinanceApi(client: ApiClient) {
  return {
    async listLedger(query: ListAdminLedgerQuery = {}) {
      const page = await client.request<AdminLedgerPage>(ep.ledger, { query });
      return {
        ...page,
        result: page.result.map((item) =>
          normalizeLedgerEntry(item as AdminLedgerEntry & { _id?: string }),
        ),
      };
    },

    listPayments(query: ListAdminPaymentsQuery = {}) {
      return client.request<PaymentsPage>(ep.payments, { query });
    },

    getPayment(id: string) {
      return client.request<PaymentWithLedger>(ep.payment(id));
    },

    rebuildWallet(input: RebuildWalletInput) {
      return client.request<RebuildWalletResult>(ep.rebuildWallet, {
        method: "POST",
        body: input,
      });
    },

    listPayouts(query: ListPayoutsQuery & { clubId?: string } = {}) {
      return client.request<PayoutsPage>(ep.payouts, { query });
    },

    createPayout(input: CreatePayoutInput & { clubId?: string }) {
      return client.request<Payout>(ep.payouts, {
        method: "POST",
        body: input,
      });
    },

    draftPeriodPayout(input: DraftPeriodPayoutInput & { clubId?: string }) {
      return client.request<Payout>(ep.draftPeriodPayout, {
        method: "POST",
        body: input,
      });
    },

    settlePayout(id: string, input: SettlePayoutInput = {}) {
      return client.request<Payout>(ep.settlePayout(id), {
        method: "POST",
        body: input,
      });
    },

    openPayoutDispute(id: string, reason: string) {
      return client.request<Payout>(ep.payoutDispute(id), {
        method: "POST",
        body: { reason },
      });
    },

    resolvePayoutDispute(id: string, input: ResolvePayoutDisputeInput) {
      return client.request<Payout>(ep.payoutDisputeResolve(id), {
        method: "POST",
        body: input,
      });
    },
  };
}

export type AdminFinanceApi = ReturnType<typeof createAdminFinanceApi>;
