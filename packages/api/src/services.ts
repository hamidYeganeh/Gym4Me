import type { ApiClient } from "./core/client";
import { accountApi } from "./features/account/api";
import { adminAccessApi } from "./features/admin-access/api";
import { advertisingApi } from "./features/advertising/api";
import { auditApi } from "./features/audit/api";
import { coachesApi } from "./features/coaches/api";
import { commerceApi } from "./features/commerce/api";
import { financeApi } from "./features/finance/api";
import { healthApi } from "./features/health/api";
import { membershipsApi } from "./features/memberships/api";
import { metaApi } from "./features/meta/api";
import { notificationsApi } from "./features/notifications/api";
import { organizationsApi } from "./features/organizations/api";
import { reviewsApi } from "./features/reviews/api";
import { supplyApi } from "./features/supply/api";
import { uploadsApi } from "./features/uploads/api";
import { verificationsApi } from "./features/verifications/api";

type BoundService<T> = {
  [K in keyof T]: T[K] extends (client: ApiClient, ...args: infer Args) => infer Result
    ? (...args: Args) => Result
    : T[K];
};

function bindService<T extends Record<string, unknown>>(service: T, client: ApiClient): BoundService<T> {
  const bound = {} as BoundService<T>;
  for (const key of Object.keys(service) as Array<keyof T>) {
    const value = service[key];
    if (typeof value === "function") {
      bound[key] = ((...args: never[]) => value(client, ...args)) as BoundService<T>[typeof key];
    }
  }
  return bound;
}

export function createGym4MeServices(client: ApiClient) {
  return {
    account: bindService(accountApi, client),
    adminAccess: bindService(adminAccessApi, client),
    advertising: bindService(advertisingApi, client),
    audit: bindService(auditApi, client),
    coaches: bindService(coachesApi, client),
    commerce: bindService(commerceApi, client),
    finance: bindService(financeApi, client),
    health: bindService(healthApi, client),
    memberships: bindService(membershipsApi, client),
    meta: bindService(metaApi, client),
    notifications: bindService(notificationsApi, client),
    organizations: bindService(organizationsApi, client),
    reviews: bindService(reviewsApi, client),
    supply: bindService(supplyApi, client),
    uploads: bindService(uploadsApi, client),
    verifications: bindService(verificationsApi, client),
  };
}

export type Gym4MeServices = ReturnType<typeof createGym4MeServices>;
