import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { KycDocumentType } from "../types";
import { createAccountKycApi, type AccountKycApi } from "./kyc.client";
import type {
  KycDocumentRequest,
  KycStatusResponse,
  SubmitIdentityInput,
} from "./kyc.dto";
import { accountKycKeys } from "./kyc.keys";

function useAccountKycApi(): AccountKycApi {
  const client = useApiClient();
  return useMemo(() => createAccountKycApi(client), [client]);
}

export function useAccountKycStatus(
  options?: Omit<
    UseQueryOptions<KycStatusResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountKycApi();
  return useQuery({
    queryKey: accountKycKeys.status(),
    queryFn: () => api.status(),
    ...options,
  });
}

export function useAccountKycDocuments(
  options?: Omit<
    UseQueryOptions<{ items: KycDocumentRequest[] }, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountKycApi();
  return useQuery({
    queryKey: accountKycKeys.documents(),
    queryFn: () => api.listDocuments(),
    ...options,
  });
}

export function useSubmitAccountKycIdentity(
  options?: UseMutationOptions<KycStatusResponse, Error, SubmitIdentityInput>,
) {
  const api = useAccountKycApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.submitIdentity(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: accountKycKeys.all });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useSubmitAccountKycDocument(
  options?: UseMutationOptions<
    KycStatusResponse,
    Error,
    { documentType: KycDocumentType; file: File | Blob; filename?: string }
  >,
) {
  const api = useAccountKycApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ documentType, file, filename }) =>
      api.submitDocument(documentType, file, filename),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: accountKycKeys.all });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
