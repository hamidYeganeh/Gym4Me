/** Account referral (`/account/referral`). */
export const accountReferralEndpoints = {
  validate: (code: string) =>
    `/account/referral/validate/${encodeURIComponent(code)}`,
  me: "/account/referral/me",
  invite: "/account/referral/invite",
  invites: "/account/referral/invites",
} as const;
