/** Account referral (`/account/referral`, `/account/me/referral`). */
export const accountReferralEndpoints = {
  validate: (code: string) =>
    `/account/referral/validate/${encodeURIComponent(code)}`,
  me: "/account/me/referral",
  invite: "/account/referral/invite",
  invites: "/account/referral/invites",
} as const;
