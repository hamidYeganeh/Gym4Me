import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { mediaFileUrl } from "@/shared/lib/api";
import type { BrowseClub } from "./clubs-browse-data";
import type { DiscoveryClubPayload } from "./map-discovery-club";

export function mapDiscoveryClubToBrowse(
  club: DiscoveryClubPayload,
): BrowseClub {
  const image =
    mediaFileUrl(club.identity.coverMediaId) ??
    mediaFileUrl(club.gallery[0]?.mediaId) ??
    PLACEHOLDER_IMAGE;

  return {
    id: club.id,
    title: club.identity.name,
    location:
      club.location?.address ?? club.location?.node?.name ?? "موقعیت نامشخص",
    image,
    rating: club.reviewsSummary.average,
    ratingCount: club.reviewsSummary.count,
    price: "—",
    featureLabels: (club.amenities ?? [])
      .map((a) => a.name)
      .filter((name): name is string => Boolean(name))
      .slice(0, 3),
    sportIds: (club.sports ?? [])
      .map((sport) => sport.id)
      .filter((id): id is string => Boolean(id)),
    distanceLabel: "",
    openState: club.operationalStatus === "active" ? "open" : "closed",
  };
}
