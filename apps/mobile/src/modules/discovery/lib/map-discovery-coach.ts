import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type { DiscoveryCoach } from "@repo/api/discovery";
import { mediaFileUrl } from "@/shared/lib/api";
import type {
  BrowseCoach,
  CoachSpecialtyId,
  ExpertCoach,
  FeaturedCoach,
  NearbyCoach,
  PopularCoach,
} from "./coaches-browse-data";
import type { CoachDetail, CoachDetailClub } from "./coach-detail-data";
import { galleryFromImages } from "./gallery-media";

function displayName(coach: DiscoveryCoach) {
  return (
    [coach.user.name.first, coach.user.name.last].filter(Boolean).join(" ").trim() ||
    "مربی"
  );
}

function specialtyLabel(coach: DiscoveryCoach) {
  return (
    coach.experience.headline ??
    coach.specialtyKeys[0] ??
    "مربی ورزشی"
  );
}

function avatarUrl(coach: DiscoveryCoach) {
  return mediaFileUrl(coach.user.avatar.mediaId) ?? PLACEHOLDER_IMAGE;
}

export function mapDiscoveryCoachToFeatured(coach: DiscoveryCoach): FeaturedCoach {
  return {
    id: coach.userId,
    name: displayName(coach),
    specialty: specialtyLabel(coach),
    image: avatarUrl(coach),
    rating: 0,
    ratingCount: 0,
    yearsExperience: coach.experience.years ?? 0,
    isCertified: coach.verification.status === "approved",
  };
}

export function mapDiscoveryCoachToPopular(coach: DiscoveryCoach): PopularCoach {
  return {
    id: coach.userId,
    name: displayName(coach),
    image: avatarUrl(coach),
    rating: 0,
    ratingCount: 0,
    yearsExperience: coach.experience.years ?? 0,
  };
}

export function mapDiscoveryCoachToExpert(coach: DiscoveryCoach): ExpertCoach {
  return {
    id: coach.userId,
    name: displayName(coach),
    image: avatarUrl(coach),
    isVerified: coach.verification.status === "approved",
  };
}

export function mapDiscoveryCoachToNearby(coach: DiscoveryCoach): NearbyCoach {
  return {
    id: coach.userId,
    name: displayName(coach),
    image: avatarUrl(coach),
    priceLabel: "",
    specialtyId: "strength",
    specialtyLabel: specialtyLabel(coach),
    distanceLabel: "",
    rating: 0,
    ratingCount: 0,
    availability: "in-person",
  };
}

function specialtyIdsFromCoach(coach: DiscoveryCoach): CoachSpecialtyId[] {
  const ids: CoachSpecialtyId[] = [];
  for (const key of coach.specialtyKeys) {
    const normalized = key.toLowerCase();
    if (normalized.includes("hiit")) ids.push("hiit");
    else if (normalized.includes("yoga") || key.includes("یوگا")) ids.push("yoga");
    else if (
      normalized.includes("strength") ||
      key.includes("قدر") ||
      key.includes("بدن")
    )
      ids.push("strength");
    else if (normalized.includes("mobil") || key.includes("موبیل"))
      ids.push("mobility");
    else if (normalized.includes("speed") || key.includes("سرعت")) ids.push("speed");
  }
  return ids.length > 0 ? [...new Set(ids)] : ["strength"];
}

export function mapDiscoveryCoachToBrowse(coach: DiscoveryCoach): BrowseCoach {
  const specialty = specialtyLabel(coach);
  const specialtyIds = specialtyIdsFromCoach(coach);
  return {
    id: coach.userId,
    title: displayName(coach),
    location: coach.clubs?.[0]?.address || coach.clubs?.[0]?.name || "تهران",
    image: avatarUrl(coach),
    rating: 0,
    ratingCount: 0,
    price: "—",
    featureLabels: [
      specialty,
      ...(coach.verification.status === "approved" ? ["تأییدشده"] : []),
    ].filter(Boolean),
    specialtyIds,
    distanceLabel: "—",
    availability: "hybrid",
    isCertified: coach.verification.status === "approved",
  };
}

export function mapDiscoveryCoachToDetail(coach: DiscoveryCoach): CoachDetail {
  const clubs: CoachDetailClub[] = (coach.clubs ?? []).map((club) => ({
    id: club.id,
    title: club.name,
    subtitle: club.address ?? undefined,
    image: mediaFileUrl(club.coverMediaId) ?? PLACEHOLDER_IMAGE,
  }));

  const years = coach.experience.years ?? 0;
  const reviewedAt = coach.verification.reviewedAt
    ? new Date(coach.verification.reviewedAt).toLocaleDateString("fa-IR")
    : null;
  const avatar = avatarUrl(coach);
  const photos = [avatar, avatar, avatar].filter(Boolean);

  return {
    id: coach.userId,
    name: displayName(coach),
    specialty: specialtyLabel(coach),
    tagline: coach.experience.headline ?? "",
    location: clubs[0]?.subtitle ?? clubs[0]?.title ?? "",
    images: photos,
    gallery: galleryFromImages(photos),
    avatar,
    availability: "hybrid",
    availabilityLabel:
      coach.verification.status === "approved" && reviewedAt
        ? `تأییدشده · ${reviewedAt}`
        : coach.verification.status === "approved"
          ? "تأییدشده"
          : "در انتظار تأیید",
    rating: 0,
    ratingCount: 0,
    yearsExperience: years,
    stats: [
      { labelKey: "years", value: String(years) },
      { labelKey: "students", value: "—" },
      { labelKey: "sessions", value: "—" },
    ],
    overview: coach.bio ?? "",
    services: [],
    specialties: coach.specialtyKeys.map((key) => ({
      id: key,
      title: key,
      subtitle: "",
    })),
    packages: [],
    clubs,
    reviews: [],
    related: [],
    pricePrefix: "از",
    priceSuffix: "تومان",
    isVerified: coach.verification.status === "approved",
  };
}
