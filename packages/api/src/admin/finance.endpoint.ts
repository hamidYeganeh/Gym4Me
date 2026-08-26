/** Platform finance ops (`/admin/finance`). */
export const adminFinanceEndpoints = {
  ledger: "/admin/finance/ledger",
  payments: "/admin/finance/payments",
  payment: (id: string) => `/admin/finance/payments/${id}`,
  rebuildWallet: "/admin/finance/wallets/rebuild",
  wallets: "/admin/finance/wallets",
  payouts: "/admin/finance/payouts",
  draftPeriodPayout: "/admin/finance/payouts/draft-period",
  settlePayout: (id: string) => `/admin/finance/payouts/${id}/settle`,
  payoutDispute: (id: string) => `/admin/finance/payouts/${id}/dispute`,
  payoutDisputeResolve: (id: string) =>
    `/admin/finance/payouts/${id}/dispute/resolve`,
} as const;
