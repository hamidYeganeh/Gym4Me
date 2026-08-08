export const accountProfileKeys = {
  all: ["account", "profile"] as const,
  me: () => [...accountProfileKeys.all, "me"] as const,
  athlete: () => [...accountProfileKeys.all, "athlete"] as const,
  coach: () => [...accountProfileKeys.all, "coach"] as const,
};
