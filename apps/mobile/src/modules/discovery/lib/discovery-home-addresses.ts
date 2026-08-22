import type { FavouriteLocation, FavouriteLocationKind, PublicUser } from "@repo/api";
import {
  formatAddressLine,
  type DiscoveryAddressItem,
} from "./discovery-addresses-data";

export type DiscoveryLocationLabels = Record<
  FavouriteLocationKind | "profile",
  string
>;

export function favouriteLocationTitle(
  item: FavouriteLocation,
  labels: DiscoveryLocationLabels,
): string {
  return item.label?.trim() || labels[item.kind];
}

export function favouriteLocationToAddressItem(
  item: FavouriteLocation,
  labels: DiscoveryLocationLabels,
): DiscoveryAddressItem | null {
  const line = formatAddressLine(item.address);
  if (!line) return null;
  return {
    id: item.id,
    label: favouriteLocationTitle(item, labels),
    line,
    city: item.address.city?.trim() || favouriteLocationTitle(item, labels),
  };
}

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
  user: PublicUser | null,
  labels: DiscoveryLocationLabels,
): DiscoveryAddressItem[] {
  const favourites = (user?.favouriteLocations ?? [])
    .map((item) => favouriteLocationToAddressItem(item, labels))
    .filter((item): item is DiscoveryAddressItem => item !== null);
  if (favourites.length > 0) return favourites;

  const profile = profileAddressItem(user, labels.profile);
  return profile ? [profile] : [];
}
