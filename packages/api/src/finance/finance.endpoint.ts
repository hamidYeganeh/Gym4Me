export const accountFinanceEndpoints = {
  wallet: "/account/finance/wallet",
  walletOverview: "/account/finance/wallet/overview",
  invoices: "/account/finance/invoices",
  invoice: (id: string) => `/account/finance/invoices/${id}`,
  invoiceFromPayment: "/account/finance/invoices/from-payment",
  ownerAnalytics: (clubId: string) =>
    `/account/clubs/${clubId}/finance/analytics/overview`,
} as const;
