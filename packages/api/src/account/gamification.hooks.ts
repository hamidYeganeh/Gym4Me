import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { Paginated } from "../types";
import {
  createAccountGamificationApi,
  type AccountGamificationApi,
} from "./gamification.client";
import type {
  GamificationSummary,
  ListMyPointTransactionsQuery,
  MyAchievement,
  PointTransactionItem,
} from "./gamification.dto";
import { accountGamificationKeys } from "./gamification.keys";

function useAccountGamificationApi(): AccountGamificationApi {
  const client = useApiClient();
  return useMemo(() => createAccountGamificationApi(client), [client]);
}

export function useGamificationSummary(
  options?: Omit<
    UseQueryOptions<GamificationSummary, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountGamificationApi();
  return useQuery({
    queryKey: accountGamificationKeys.summary(),
    queryFn: () => api.summary(),
    ...options,
  });
}

export function useMyAchievements(
  options?: Omit<UseQueryOptions<MyAchievement[], Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountGamificationApi();
  return useQuery({
    queryKey: accountGamificationKeys.achievements(),
    queryFn: () => api.achievements(),
    ...options,
  });
}

export function useMyPointTransactions(
  query: ListMyPointTransactionsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<PointTransactionItem>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountGamificationApi();
  return useQuery({
    queryKey: accountGamificationKeys.transactions(query),
    queryFn: () => api.transactions(query),
    ...options,
  });
}
