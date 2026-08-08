export const accountReferralKeys = {
  all: ["account", "referral"] as const,
  me: () => [...accountReferralKeys.all, "me"] as const,
  validate: (code: string) =>
    [...accountReferralKeys.all, "validate", code] as const,
  invites: () => [...accountReferralKeys.all, "invites"] as const,
};
