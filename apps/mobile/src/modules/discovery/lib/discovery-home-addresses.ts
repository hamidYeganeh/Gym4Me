import type { PublicUser } from "@repo/api";
import {
  DISCOVERY_MOCK_ADDRESSES,
  formatAddressLine,
  type DiscoveryAddressItem,
} from "./discovery-addresses-data";

export function profileAddressItem(
  user: PublicUser | null,
  label: string,
): DiscoveryAddressItem | null {
  if (!user) return null;
  const line = formatAddressLine(user.address);
  if (!line) return null;
  return {
    id: "profile",
    label,
    line,
    city: user.address.city?.trim() || label,
  };
}

export function buildDiscoveryAddresses(
  profile: DiscoveryAddressItem | null,
): DiscoveryAddressItem[] {
  if (!profile) return DISCOVERY_MOCK_ADDRESSES;
  return [
    profile,
    ...DISCOVERY_MOCK_ADDRESSES.filter((item) => item.id !== "home"),
  ];
}
