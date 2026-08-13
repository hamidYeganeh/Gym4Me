import type { ApiClient } from "../client";
import type {
  AnalyticsPeriod,
  CashShift,
  CashShiftsPage,
  CloseCashShiftInput,
  CompensationRule,
  CompensationRulesPage,
  CreateDebtInput,
  CreatePayoutInput,
  Debt,
  DebtsPage,
  DraftPeriodPayoutInput,
  Invoice,
  InvoicesPage,
  IssueInvoiceFromPaymentInput,
  ListCompensationRulesQuery,
  ListDebtsQuery,
  ListInvoicesQuery,
  ListPaymentsQuery,
  ListPayoutsQuery,
  OwnerFinanceAnalytics,
  PaymentChannel,
  PaymentRecord,
  PaymentsPage,
  PaymentWithLedger,
  Payout,
  PayoutsPage,
  RecordDebtPaymentInput,
  RecordManualPaymentInput,
  ResolvePayoutDisputeInput,
  UpsertCompensationRuleInput,
  WalletOverview,
} from "./finance.dto";
import { accountFinanceEndpoints as ep } from "./finance.endpoint";

export type TopUpWalletInput = {
  amount: number;
  channel?: PaymentChannel;
  idempotencyKey: string;
  orderId?: string;
  authority?: string;
  gatewayRefId?: string;
};

export function createAccountFinanceApi(client: ApiClient) {
  return {
    walletOverview() {
      return client.request<WalletOverview>(ep.walletOverview);
    },

    listPayments(query: ListPaymentsQuery = {}) {
      return client.request<PaymentsPage>(ep.payments, { query });
    },

    topUpWallet(input: TopUpWalletInput) {
      return client.request<PaymentRecord>(ep.walletTopUp, {
        method: "POST",
        body: input,
      });
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

    // ── Owner desk ops ──────────────────────────────────────────────────────

    listClubPayments(clubId: string, query: ListPaymentsQuery = {}) {
      return client.request<PaymentsPage>(ep.ownerPayments(clubId), { query });
    },

    getClubPayment(clubId: string, paymentId: string) {
      return client.request<PaymentWithLedger>(
        ep.ownerPayment(clubId, paymentId),
      );
    },

    recordManualPayment(clubId: string, input: RecordManualPaymentInput) {
      return client.request<PaymentRecord>(ep.ownerManualPayment(clubId), {
        method: "POST",
        body: input,
      });
    },

    listCashShifts(
      clubId: string,
      query: { page?: number; page_size?: number } = {},
    ) {
      return client.request<CashShiftsPage>(ep.ownerShifts(clubId), { query });
    },

    getOpenCashShift(clubId: string) {
      return client.request<CashShift | null>(ep.ownerOpenShift(clubId));
    },

    openCashShift(clubId: string) {
      return client.request<CashShift>(ep.ownerShifts(clubId), {
        method: "POST",
        body: {},
      });
    },

    closeCashShift(
      clubId: string,
      shiftId: string,
      input: CloseCashShiftInput,
    ) {
      return client.request<CashShift>(ep.ownerCloseShift(clubId, shiftId), {
        method: "POST",
        body: input,
      });
    },

    listClubPayouts(clubId: string, query: ListPayoutsQuery = {}) {
      return client.request<PayoutsPage>(ep.ownerPayouts(clubId), { query });
    },

    createPayout(clubId: string, input: CreatePayoutInput) {
      return client.request<Payout>(ep.ownerPayouts(clubId), {
        method: "POST",
        body: input,
      });
    },

    draftPeriodPayout(clubId: string, input: DraftPeriodPayoutInput) {
      return client.request<Payout>(ep.ownerDraftPeriodPayout(clubId), {
        method: "POST",
        body: input,
      });
    },

    openPayoutDispute(clubId: string, payoutId: string, reason: string) {
      return client.request<Payout>(ep.ownerPayoutDispute(clubId, payoutId), {
        method: "POST",
        body: { reason },
      });
    },

    resolvePayoutDispute(
      clubId: string,
      payoutId: string,
      input: ResolvePayoutDisputeInput,
    ) {
      return client.request<Payout>(
        ep.ownerPayoutDisputeResolve(clubId, payoutId),
        { method: "POST", body: input },
      );
    },

    listDebts(clubId: string, query: ListDebtsQuery = {}) {
      return client.request<DebtsPage>(ep.ownerDebts(clubId), { query });
    },

    createDebt(clubId: string, input: CreateDebtInput) {
      return client.request<Debt>(ep.ownerDebts(clubId), {
        method: "POST",
        body: input,
      });
    },

    getDebt(clubId: string, debtId: string) {
      return client.request<Debt>(ep.ownerDebt(clubId, debtId));
    },

    recordDebtPayment(
      clubId: string,
      debtId: string,
      input: RecordDebtPaymentInput,
    ) {
      return client.request<Debt>(ep.ownerDebtPayments(clubId, debtId), {
        method: "POST",
        body: input,
      });
    },

    listCompensationRules(
      clubId: string,
      query: ListCompensationRulesQuery = {},
    ) {
      return client.request<CompensationRulesPage>(
        ep.ownerCompensationRules(clubId),
        { query },
      );
    },

    upsertCompensationRule(clubId: string, input: UpsertCompensationRuleInput) {
      return client.request<CompensationRule>(
        ep.ownerCompensationRules(clubId),
        { method: "PUT", body: input },
      );
    },
  };
}

export type AccountFinanceApi = ReturnType<typeof createAccountFinanceApi>;
