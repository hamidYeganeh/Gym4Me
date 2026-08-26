export const accountFinanceEndpoints = {
  wallet: "/account/finance/wallet",
  walletOverview: "/account/finance/wallet/overview",
  walletTopUp: "/account/finance/wallet/topup",
  walletTopUpVerify: "/account/finance/wallet/topup/verify",
  payments: "/account/finance/payments",
  invoices: "/account/finance/invoices",
  invoice: (id: string) => `/account/finance/invoices/${id}`,
  invoiceFromPayment: "/account/finance/invoices/from-payment",
  ownerAnalytics: (clubId: string) =>
    `/account/clubs/${clubId}/finance/analytics/overview`,
  // ── Owner desk ops (`/account/clubs/:clubId/finance`) ────────────────────
  ownerPayments: (clubId: string) =>
    `/account/clubs/${clubId}/finance/payments`,
  ownerPayment: (clubId: string, paymentId: string) =>
    `/account/clubs/${clubId}/finance/payments/${paymentId}`,
  ownerInvoices: (clubId: string) =>
    `/account/clubs/${clubId}/finance/invoices`,
  ownerManualPayment: (clubId: string) =>
    `/account/clubs/${clubId}/finance/payments/manual`,
  ownerShifts: (clubId: string) => `/account/clubs/${clubId}/finance/shifts`,
  ownerOpenShift: (clubId: string) =>
    `/account/clubs/${clubId}/finance/shifts/open`,
  ownerCloseShift: (clubId: string, shiftId: string) =>
    `/account/clubs/${clubId}/finance/shifts/${shiftId}/close`,
  ownerPayouts: (clubId: string) => `/account/clubs/${clubId}/finance/payouts`,
  ownerDraftPeriodPayout: (clubId: string) =>
    `/account/clubs/${clubId}/finance/payouts/draft-period`,
  ownerPayoutDispute: (clubId: string, payoutId: string) =>
    `/account/clubs/${clubId}/finance/payouts/${payoutId}/dispute`,
  ownerPayoutDisputeResolve: (clubId: string, payoutId: string) =>
    `/account/clubs/${clubId}/finance/payouts/${payoutId}/dispute/resolve`,
  ownerDebts: (clubId: string) => `/account/clubs/${clubId}/finance/debts`,
  ownerDebt: (clubId: string, debtId: string) =>
    `/account/clubs/${clubId}/finance/debts/${debtId}`,
  ownerDebtPayments: (clubId: string, debtId: string) =>
    `/account/clubs/${clubId}/finance/debts/${debtId}/payments`,
  ownerCompensationRules: (clubId: string) =>
    `/account/clubs/${clubId}/finance/compensation-rules`,
} as const;
