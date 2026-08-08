import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import { createMediaApi, type MediaApi } from "./media.client";
import type { MediaAsset } from "./media.dto";
import { mediaKeys } from "./media.keys";

function useMediaApi(): MediaApi {
  const client = useApiClient();
  return useMemo(() => createMediaApi(client), [client]);
}

export function useMediaMeta(
  id: string,
  options?: Omit<UseQueryOptions<MediaAsset, Error>, "queryKey" | "queryFn">,
) {
  const api = useMediaApi();
  return useQuery({
    queryKey: mediaKeys.detail(id),
    queryFn: () => api.getMeta(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...options,
  });
}

export function useUploadMedia(
  options?: UseMutationOptions<
    MediaAsset,
    Error,
    { file: File | Blob; filename?: string }
  >,
) {
  const api = useMediaApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ file, filename }) => api.upload(file, filename),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
