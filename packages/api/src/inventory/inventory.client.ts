import type { ApiClient } from "../client";
import type {
  ClubInventoryItem,
  CreateInventoryItemInput,
  InventoryPage,
  ListInventoryQuery,
  UpdateInventoryItemInput,
} from "./inventory.dto";
import { inventoryEndpoints as ep } from "./inventory.endpoint";

export function createInventoryApi(client: ApiClient) {
  return {
    list(clubId: string, query: ListInventoryQuery = {}) {
      return client.request<InventoryPage>(ep.list(clubId), { query });
    },
    create(clubId: string, input: CreateInventoryItemInput) {
      return client.request<ClubInventoryItem>(ep.list(clubId), {
        method: "POST",
        body: input,
      });
    },
    update(
      clubId: string,
      itemId: string,
      input: UpdateInventoryItemInput,
    ) {
      return client.request<ClubInventoryItem>(ep.item(clubId, itemId), {
        method: "PATCH",
        body: input,
      });
    },
    archive(clubId: string, itemId: string, expectedVersion: number) {
      return client.request<ClubInventoryItem>(ep.item(clubId, itemId), {
        method: "DELETE",
        query: { expectedVersion },
      });
    },
  };
}

export type InventoryApi = ReturnType<typeof createInventoryApi>;
