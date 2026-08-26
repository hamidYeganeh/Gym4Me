import type { ApiClient } from "../client";
import type { MediaAsset, MediaUploadOptions } from "./media.dto";
import { mediaEndpoints as ep } from "./media.endpoint";

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
      if (options.visibility) {
        formData.append("visibility", options.visibility);
      }
      if (options.purpose) {
        formData.append("purpose", options.purpose);
      }
      return client.request<MediaAsset>(ep.root, {
        method: "POST",
        formData,
      });
    },

    getMeta(id: string) {
      return client.request<MediaAsset>(ep.byId(id), { public: true });
    },

    download(id: string) {
      return client.requestBlob(ep.file(id));
    },

    fileUrl(id: string) {
      return `${client.getBaseUrl()}${ep.file(id)}`;
    },
  };
}

export type MediaApi = ReturnType<typeof createMediaApi>;
