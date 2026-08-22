export const accountProfileKeys = {
  all: ["account", "profile"] as const,
  me: () => [...accountProfileKeys.all, "me"] as const,
  settings: () => [...accountProfileKeys.all, "settings"] as const,
  athlete: () => [...accountProfileKeys.all, "athlete"] as const,
  coach: () => [...accountProfileKeys.all, "coach"] as const,
  locations: () => [...accountProfileKeys.all, "locations"] as const,
  location: (id: string) => [...accountProfileKeys.locations(), id] as const,
};
