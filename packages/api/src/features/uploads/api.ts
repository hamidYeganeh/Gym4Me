import type { ApiClient } from "../../core/client";
export interface UploadedAsset extends Record<string, unknown> {
  file: { url: string; mime_type: string; size_bytes: number; checksum_sha256: string };
}
export const uploadsApi = {
  upload: async (
    client: ApiClient,
    file: File,
    input: {
      purpose: "verification" | "avatar" | "club_gallery" | "advertising_creative";
      organization_id?: string;
      visibility?: "private" | "organization" | "public";
    },
  ) => {
    const body = new FormData();
    body.append("file", file);
    return (await client.request<UploadedAsset>("/uploads", { method: "POST", body, query: input }))
      .data;
  },
};
