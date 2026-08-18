import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import type { PublicChoiceGroup } from "./choices.dto";
import { basicsChoicesEndpoints as ep } from "./choices.endpoint";

/** Public choice groups (`/basics/choices`). */
export function createBasicsChoicesApi(client: ApiClient) {
  return {
    list() {
      return client.request<Paginated<PublicChoiceGroup>>(ep.list, {
        public: true,
      });
    },

    get(key: string) {
      return client.request<PublicChoiceGroup>(ep.byKey(key), { public: true });
    },

    async listUnitGroups() {
      const page = await client.request<Paginated<PublicChoiceGroup>>(ep.units, {
        public: true,
      });
      return page.result;
    },
  };
}

export type BasicsChoicesApi = ReturnType<typeof createBasicsChoicesApi>;
