import type { Paginated } from "../types";
import type {
  PlatformEntitlementContract,
  PlatformPlan,
  PlatformSubscription,
  PlatformSubscriptionStatus,
} from "../memberships/memberships.dto";

export type { PlatformPlan, PlatformSubscription };

export type ListAdminPlatformPlansQuery = {
  page?: number;
  page_size?: number;
  status?: "active" | "inactive" | "archived";
};

export type CreatePlatformPlanInput = {
  code: string;
  name: string;
  description?: string;
  pricing: {
    amount: number;
    tax?: number;
    currency?: string;
    periodDays?: number;
  };
  features?: string[];
  entitlementContract?: PlatformEntitlementContract;
  contractReady?: boolean;
  postExpirationMode?: "free_plan" | "read_only";
  fallbackPlanId?: string;
  status?: "active" | "inactive" | "archived";
};

export type UpdatePlatformPlanInput = Partial<
  Omit<CreatePlatformPlanInput, "code">
>;

export type ListAdminPlatformSubscriptionsQuery = {
  page?: number;
  page_size?: number;
  status?: PlatformSubscriptionStatus;
  userId?: string;
  planId?: string;
};

export type AdminPlatformPlansPage = Paginated<PlatformPlan>;
export type AdminPlatformSubscriptionsPage = Paginated<PlatformSubscription>;
