import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createClubStaffApi,
  type ClubStaffApi,
} from "./staff.client";
import type {
  ListStaffQuery,
  StaffPage,
  UpdateStaffPermissionsInput,
  UpsertStaffInput,
} from "./staff.dto";
import { clubStaffKeys } from "./staff.keys";

function useClubStaffApi(): ClubStaffApi {
  const client = useApiClient();
  return useMemo(() => createClubStaffApi(client), [client]);
}

export function useClubStaffList(
  clubId: string,
  query: ListStaffQuery = {},
  options?: Omit<UseQueryOptions<StaffPage, Error>, "queryKey" | "queryFn">,
) {
  const api = useClubStaffApi();
  return useQuery({
    queryKey: clubStaffKeys.list(clubId, query),
    queryFn: () => api.list(clubId, query),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useUpsertClubStaff(clubId: string) {
  const api = useClubStaffApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertStaffInput) => api.upsert(clubId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clubStaffKeys.lists(clubId),
      });
    },
  });
}

export function useUpdateClubStaff(clubId: string) {
  const api = useClubStaffApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      staffId,
      input,
    }: {
      staffId: string;
      input: UpdateStaffPermissionsInput;
    }) => api.update(clubId, staffId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clubStaffKeys.lists(clubId),
      });
    },
  });
}

export function useRevokeClubStaff(clubId: string) {
  const api = useClubStaffApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (staffId: string) => api.revoke(clubId, staffId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clubStaffKeys.lists(clubId),
      });
    },
  });
}
