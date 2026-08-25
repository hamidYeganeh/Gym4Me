import type { ApiClient } from "../client";
import type {
  ActionCenterKind,
  ActionCenterResult,
} from "./action-center.dto";

export function createAccountActionCenterApi(client: ApiClient) {
  return {
    get() {
      return client.request<ActionCenterResult>("/account/action-center");
    },
    click(input: { itemId: string; kind: ActionCenterKind }) {
      return client.request<{ ok?: boolean }>("/account/action-center/click", {
        method: "POST",
        body: input,
      });
    },
  };
}

export type AccountActionCenterApi = ReturnType<
  typeof createAccountActionCenterApi
>;
