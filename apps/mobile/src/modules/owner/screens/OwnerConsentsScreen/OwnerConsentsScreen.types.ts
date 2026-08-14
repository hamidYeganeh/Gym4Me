import type { OwnerConsentPolicy } from "../../lib/owner-consents-data";

export type OwnerConsentsScreenProps = {
  policies: OwnerConsentPolicy[];
  className?: string;
};
