export const accountKycKeys = {
  all: ["account", "kyc"] as const,
  status: () => [...accountKycKeys.all, "status"] as const,
  documents: () => [...accountKycKeys.all, "documents"] as const,
};
