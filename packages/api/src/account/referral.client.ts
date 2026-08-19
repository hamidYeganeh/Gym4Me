import type { ApiClient } from "../client";
import type {
  InviteInput,
  InviteResponse,
  MyReferralResponse,
  ReferralInvite,
  ValidateReferralResponse,
} from "./referral.dto";
import { accountReferralEndpoints as ep } from "./referral.endpoint";

/** Account referral (`/account/referral`, `/account/me/referral`). */
export function createAccountReferralApi(client: ApiClient) {
  return {
    validate(code: string) {
      return client.request<ValidateReferralResponse>(ep.validate(code), {
        public: true,
      });
    },

    me() {
      return client.request<MyReferralResponse>(ep.me);
    },

    invite(input: InviteInput) {
      return client.request<InviteResponse>(ep.invite, {
        method: "POST",
        body: input,
      });
    },

    listInvites() {
      return client.request<{ items: ReferralInvite[] }>(ep.invites);
    },
  };
}

export type AccountReferralApi = ReturnType<typeof createAccountReferralApi>;
