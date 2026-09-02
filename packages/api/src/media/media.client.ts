import type { ApiClient } from "../client";
import type { MediaAsset, MediaUploadOptions } from "./media.dto";
import { mediaEndpoints as ep } from "./media.endpoint";

type CurrentAsset = Record<string, any>;

function normalizeAsset(value: CurrentAsset): MediaAsset {
  const profile = value.profile ?? {};
  const access = value.access ?? {};
  const file = value.file ?? {};
  const purpose = String(profile.purpose ?? "general") as MediaAsset["purpose"];
  return {
    id: String(value._id ?? value.id ?? ""),
    mimeType: String(profile.mimeType ?? file.mime_type ?? "application/octet-stream"),
    size: Number(profile.sizeBytes ?? file.size_bytes ?? 0),
    hash: file.checksum_sha256 ? String(file.checksum_sha256) : null,
    originalName: profile.originalName ? String(profile.originalName) : null,
    visibility: access.visibility === "public" ? "public" : "private",
    purpose,
    scanStatus: "clean",
    url: String(file.url ?? ""),
    createdAt: String(value.createdAt ?? new Date(0).toISOString()),
  };
}

/** Media upload / resolve helpers (`/media`). */
export function createMediaApi(client: ApiClient) {
  return {
    upload(
      file: File | Blob,
      filename?: string,
      options: MediaUploadOptions = {},
    ) {
      const formData = new FormData();
      if (filename && file instanceof Blob && !(file instanceof File)) {
        formData.append("file", file, filename);
      } else {
        formData.append("file", file);
      }
      const query = {
        visibility: options.visibility ?? "private",
        purpose: options.purpose ?? "general",
      };
      return client.request<CurrentAsset>(ep.root, {
        method: "POST",
        formData,
        query,
      }).then(normalizeAsset);
    },

    getMeta(id: string) {
      return client.request<CurrentAsset>(ep.byId(id)).then(normalizeAsset);
    },

    download(id: string) {
      return client.requestBlob(ep.privateFile(id));
    },

    fileUrl(id: string) {
      return `${client.getBaseUrl()}${ep.publicFile(id)}`;
    },
  };
}

export type MediaApi = ReturnType<typeof createMediaApi>;
