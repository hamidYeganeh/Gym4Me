import type { DiscoveryAddressItem } from "../../lib/discovery-addresses-data";

export type DiscoveryHomeHeaderSectionProps = {
  locationLabel: string;
  coachCityName?: string;
  citiesFallbackName?: string;
  onLocationChange?: (address: DiscoveryAddressItem) => void;
};
