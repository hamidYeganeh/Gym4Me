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
  PaymentRecord,
  PaymentStatus,
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
  idempotencyKey: string;
  callbackUrl: string;
};

export type WalletTopUpInitiation = {
  paymentId: string;
  status: PaymentStatus;
  authority: string | null;
  redirectUrl: string | null;
  idempotent: boolean;
};

const row = (value: unknown): Record<string, any> =>
  value && typeof value === "object" ? (value as Record<string, any>) : {};
const minorToToman = (value: unknown) =>
  Number(BigInt(String(value ?? "0")) / BigInt(10));

function currentInvoice(value: unknown): Invoice {
  const item = row(value);
  const totals = row(item.totals);
  const recipient = row(item.recipient);
  const lines = (Array.isArray(item.lines) ? item.lines : []).map((value) => {
    const line = row(value);
    return {
      title: String(line.title ?? "صورتحساب"),
      qty: Number(line.quantity ?? 1),
      unitPrice: minorToToman(line.unitAmountMinor),
      total: minorToToman(line.totalMinor),
    };
  });
  const issuedAt = String(item.issuedAt ?? item.createdAt ?? new Date(0).toISOString());
  return {
    id: String(item._id ?? item.id ?? ""),
    paymentId: String(row(item.source).paymentId ?? ""),
    number: String(item.number ?? ""),
    title: lines[0]?.title ?? "صورتحساب Gym4Me",
    status: item.status === "void" ? "void" : "issued",
    lines,
    amounts: {
      subtotal: minorToToman(totals.subtotalMinor),
      discount: minorToToman(totals.discountMinor),
      tax: minorToToman(totals.taxMinor),
      payable: minorToToman(totals.totalMinor),
    },
    party: {
      payerUserId: recipient.userId ? String(recipient.userId) : null,
      clubName: null,
      clubId: item.organizationId ? String(item.organizationId) : null,
    },
    issuedAt,
    voidedAt: item.status === "void" ? String(item.updatedAt ?? issuedAt) : null,
    createdAt: String(item.createdAt ?? issuedAt),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? issuedAt),
  };
}

function currentPayment(value: unknown): PaymentRecord {
  const item = row(value);
  const amount = row(item.amount);
  const payable = row(item.payable);
  const provider = row(item.provider);
  const status = String(item.status ?? "pending");
  const purpose: PaymentRecord["purpose"] =
    payable.type === "wallet"
      ? "wallet_topup"
      : payable.type === "membership_contract"
        ? "membership"
        : "booking";
  return {
    _id: String(item._id ?? item.id ?? ""),
    purpose,
    channel: "wallet",
    status:
      status === "paid"
        ? "captured"
        : status === "partially_refunded"
          ? "partially_refunded"
          : status === "refunded"
            ? "refunded"
            : status === "cancelled"
              ? "cancelled"
              : "pending",
    amount: { gross: minorToToman(amount.amountMinor) },
    reference: {
      orderId: String(item._id ?? ""),
      authority: provider.authority ? String(provider.authority) : null,
    },
    payer: { userId: item.payerUserId ? String(item.payerUserId) : null },
    related: {
      bookingId: payable.type === "booking" ? String(payable.id) : null,
      membershipId: payable.type === "membership_contract" ? String(payable.id) : null,
    },
    capturedAt: item.paidAt ? String(item.paidAt) : null,
    createdAt: String(item.createdAt ?? new Date(0).toISOString()),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? new Date(0).toISOString()),
  };
}

export function createAccountFinanceApi(client: ApiClient) {
  return {
    async walletOverview() {
      const value = row(await client.request<unknown>("/finance/wallet/me"));
      return {
        owner: { type: "user", id: String(row(value.wallet).owner?.id ?? "") },
        balance: minorToToman(row(value.balance).amountMinor),
        currency: "IRT",
        balancePoints: [],
        incomeSeries: [],
        spendSeries: [],
      } satisfies WalletOverview;
    },

    async listPayments(query: ListPaymentsQuery = {}) {
      const items = await client.request<unknown[]>("/finance/payments/me", { query });
      const result = items.map(currentPayment);
      return {
        result,
        pagination: { page: 1, page_size: result.length, count: result.length, total: result.length, prev: null, next: null },
      } as PaymentsPage;
    },

    async topUpWallet(input: TopUpWalletInput) {
      const payment = row(await client.request<unknown>("/finance/wallet/me/top-ups", {
        method: "POST",
        headers: { "idempotency-key": input.idempotencyKey },
        body: { amount_minor: String(Math.round(input.amount * 10)), currency: "IRR" },
      }));
      const paymentId = String(payment._id ?? payment.id ?? "");
      return {
        paymentId,
        status: "pending",
        authority: paymentId,
        redirectUrl: `/athlete/payment/test?paymentId=${encodeURIComponent(paymentId)}&returnPath=${encodeURIComponent("/athlete/wallet")}`,
        idempotent: false,
      } satisfies WalletTopUpInitiation;
    },

    async verifyWalletTopUp(input: { authority: string; status: "OK" | "NOK" }) {
      const payment = await client.request<unknown>(
        `/finance/mock-gateway/payments/${encodeURIComponent(input.authority)}`,
      );
      return currentPayment(payment);
    },

    async listInvoices(query: ListInvoicesQuery = {}) {
      const items = await client.request<unknown[]>("/finance/invoices/me", { query });
      const result = items.map(currentInvoice);
      return {
        result,
        pagination: { page: 1, page_size: result.length, count: result.length, total: result.length, prev: null, next: null },
      } as InvoicesPage;
    },

    async getInvoice(id: string) {
      const page = await this.listInvoices({ page_size: 100 });
      const invoice = page.result.find((item) => item.id === id);
      if (!invoice) throw new Error("Invoice was not found.");
      return invoice;
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

    listClubInvoices(clubId: string, query: ListInvoicesQuery = {}) {
      return client.request<InvoicesPage>(ep.ownerInvoices(clubId), { query });
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
