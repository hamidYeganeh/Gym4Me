import type { ApiClient } from "../client";
import type { RefItem, RefType } from "../types";
import type { BasicsRefListResponse } from "./refs.dto";
import { basicsRefsEndpoints as ep } from "./refs.endpoint";

/** Public flat refs (`/basics/ref/:type`). */
export function createBasicsRefsApi(client: ApiClient) {
  return {
    list(type: RefType) {
      return client.request<BasicsRefListResponse>(ep.list(type), {
        public: true,
      });
    },

    get(type: RefType, id: string) {
      return client.request<RefItem>(ep.byId(type, id), { public: true });
    },
  };
}

export type BasicsRefsApi = ReturnType<typeof createBasicsRefsApi>;
