import type { Paginated } from "../types";

export type InvoiceStatus = "issued" | "void";
export type AnalyticsPeriod = "week" | "month" | "quarter";

export type InvoiceLine = {
  title: string;
  qty: number;
  unitPrice: number;
  total: number;
};

export type Invoice = {
  id: string;
  paymentId: string;
  number: string;
  title: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  amounts: {
    subtotal: number;
    discount: number;
    tax: number;
    payable: number;
  };
  party: {
    payerUserId: string | null;
    clubName: string | null;
    clubId: string | null;
  };
  issuedAt: string;
  voidedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WalletOverview = {
  owner: { type: string; id: string };
  balance: number;
  currency: string;
  balancePoints: { label: string; value: number }[];
  incomeSeries: number[];
  spendSeries: number[];
};

export type OwnerFinanceKpi = {
  id: "new-members" | "renewal" | "churn" | "attendance" | string;
  value: number;
  chart: "line" | "bar";
  series: number[];
  comparisonSeries?: number[];
};

export type OwnerFinanceAnalytics = {
  period: AnalyticsPeriod;
  kpis: OwnerFinanceKpi[];
  totals: {
    activeMembers: number;
    newMembers: number;
    cancelledMembers: number;
    capturedGross: number;
  };
};

export type ListInvoicesQuery = {
  page?: number;
  page_size?: number;
  status?: InvoiceStatus;
};

export type IssueInvoiceFromPaymentInput = {
  paymentId: string;
};

export type InvoicesPage = Paginated<Invoice>;
