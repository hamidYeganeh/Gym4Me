"use client";
import { useMutation } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { uploadsApi } from "./api";
export function useUploadAssetMutation() {
  const client = useApiClient();
  return useMutation({
    mutationFn: ({
      file,
      ...input
    }: {
      file: File;
      purpose: "verification" | "avatar" | "club_gallery" | "advertising_creative";
      organization_id?: string;
      visibility?: "private" | "organization" | "public";
    }) => uploadsApi.upload(client, file, input),
  });
}
