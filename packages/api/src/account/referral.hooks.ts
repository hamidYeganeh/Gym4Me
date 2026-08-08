import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAccountReferralApi,
  type AccountReferralApi,
} from "./referral.client";
import type {
  InviteInput,
  InviteResponse,
  MyReferralResponse,
  ReferralInvite,
  ValidateReferralResponse,
} from "./referral.dto";
import { accountReferralKeys } from "./referral.keys";

function useAccountReferralApi(): AccountReferralApi {
  const client = useApiClient();
  return useMemo(() => createAccountReferralApi(client), [client]);
}

export function useValidateReferral(
  code: string,
  options?: Omit<
    UseQueryOptions<ValidateReferralResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountReferralApi();
  return useQuery({
    queryKey: accountReferralKeys.validate(code),
    queryFn: () => api.validate(code),
    enabled: Boolean(code) && (options?.enabled ?? true),
    ...options,
  });
}

export function useMyReferral(
  options?: Omit<
    UseQueryOptions<MyReferralResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountReferralApi();
  return useQuery({
    queryKey: accountReferralKeys.me(),
    queryFn: () => api.me(),
    ...options,
  });
}

export function useReferralInvites(
  options?: Omit<
    UseQueryOptions<{ items: ReferralInvite[] }, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountReferralApi();
  return useQuery({
    queryKey: accountReferralKeys.invites(),
    queryFn: () => api.listInvites(),
    ...options,
  });
}

export function useInviteReferral(
  options?: UseMutationOptions<InviteResponse, Error, InviteInput>,
) {
  const api = useAccountReferralApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.invite(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountReferralKeys.invites(),
      });
      void queryClient.invalidateQueries({
        queryKey: accountReferralKeys.me(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
