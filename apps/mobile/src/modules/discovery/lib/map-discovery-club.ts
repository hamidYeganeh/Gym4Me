import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type {
  ClubCalendarResponse,
  ClubClass,
  ClubUserReview,
} from "@repo/api/discovery";
import type { ClubMembershipPlan } from "@repo/api";
import { mediaFileUrl } from "@/shared/lib/api";
import type {
  ClubDetail,
  ClubDetailAmenity,
  ClubDetailAmenityIconKey,
  ClubDetailBranch,
  ClubDetailCoach,
  ClubDetailEquipment,
  ClubDetailGalleryItem,
  ClubDetailReview,
  ClubDetailSport,
  ClubDetailSubscription,
} from "./club-detail-data";
import { withGalleryCardDefaults } from "./gallery-media";
import { mapDiscoveryClassToPreview } from "./map-discovery-class";

/** Runtime discovery club payload (API hydrates refs beyond the thin Club DTO). */
export type DiscoveryClubPayload = {
  id: string;
  identity: {
    name: string;
    description: string | null;
    coverMediaId: string | null;
  };
  gallery: Array<{
    mediaId: string;
    title: string | null;
    description: string | null;
    views?: number;
    createdAt?: string;
  }>;
  amenities?: Array<{
    amenityId?: string;
    id?: string;
    name?: string;
    slug?: string;
    description?: string | null;
    icon?: string | null;
  }>;
  equipments?: Array<{
    equipmentId?: string;
    id?: string;
    name?: string;
    description?: string | null;
  }>;
  sports?: Array<{
    sportId?: string;
    id?: string;
    name?: string;
    description?: string | null;
    coverMediaId?: string | null;
  }>;
  coaches?: Array<{
    coachId: string;
    name?: { first?: string | null; last?: string | null };
    avatar?: { mediaId?: string | null };
  }>;
  categories?: Array<{
    categoryId?: string;
    id?: string;
    name?: string;
  }>;
  location?: {
    address: string;
    point: { lng: number; lat: number } | null;
    ancestors?: Array<{ name?: string; kind?: string; level?: string }>;
    node?: {
      name?: string;
      kind?: string;
      ancestors?: Array<{ name?: string; kind?: string; level?: string }>;
    } | null;
  } | null;
  contact?: {
    phones?: Array<{ number: string; label?: string | null }>;
  };
  rules?: Array<{
    policy: "required" | "recommended" | "prohibited";
    title: string;
    description?: string | null;
  }>;
  faq?: Array<{ title: string; description: string }>;
  audience?: {
    genderPolicy?: string | null;
    ageGroupKeys?: string[];
    levelKeys?: string[];
    accessibility?: string;
  };
  achievements?: Array<{
    achievementId?: string;
    id?: string;
    name?: string;
    title?: string;
  }>;
  owner?: {
    id?: string;
    name?: { first?: string | null; last?: string | null };
    avatar?: { mediaId?: string | null };
  } | null;
  reviewsSummary: {
    count: number;
    average: number;
  };
  operatingHours: Array<{
    weekday: number;
    status: "open" | "closed";
    audience?: "shared" | "male" | "female";
    open?: string;
    close?: string;
  }>;
  operationalStatus: "active" | "inactive";
};

type HourAudience = "shared" | "male" | "female";

function resolveAudience(
  audience: HourAudience | undefined,
): HourAudience {
  return audience ?? "shared";
}

function formatHourRange(row: {
  status: "open" | "closed";
  open?: string;
  close?: string;
}): string {
  if (row.status === "closed") return "تعطیل";
  return `${row.open ?? "—"} – ${row.close ?? "—"}`;
}

function isRowOpenNow(row: {
  status: "open" | "closed";
  open?: string;
  close?: string;
}): boolean {
  if (row.status === "closed" || !row.open || !row.close) return false;
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = row.open.split(":").map(Number);
  const [closeH, closeM] = row.close.split(":").map(Number);
  if (
    [openH, openM, closeH, closeM].some((n) => Number.isNaN(n))
  ) {
    return true;
  }
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  if (closeMinutes <= openMinutes) {
    return minutes >= openMinutes || minutes < closeMinutes;
  }
  return minutes >= openMinutes && minutes < closeMinutes;
}

type BranchLike = {
  id: string;
  identity: { name: string; coverMediaId: string | null };
  location?: { address: string } | null;
  gallery: Array<{ mediaId: string }>;
};

const AMENITY_ICON_BY_SLUG: Record<string, ClubDetailAmenityIconKey> = {
  wifi: "wifi",
  parking: "parking",
  shower: "shower",
  locker: "locker",
  ac: "ac",
  cafe: "cafe",
};

function displayName(name?: { first?: string | null; last?: string | null }) {
  return [name?.first, name?.last].filter(Boolean).join(" ").trim() || "مربی";
}

function formatOpenHours(
  hours: DiscoveryClubPayload["operatingHours"],
): { label: string; isOpen: boolean } {
  if (!hours?.length) {
    return { label: "ساعات کاری نامشخص", isOpen: true };
  }
  const today = (new Date().getDay() + 1) % 7;
  const todayRows = hours.filter((h) => h.weekday === today);
  const rows = todayRows.length > 0 ? todayRows : hours;

  const male = rows.find((h) => resolveAudience(h.audience) === "male");
  const female = rows.find((h) => resolveAudience(h.audience) === "female");
  const shared = rows.find((h) => resolveAudience(h.audience) === "shared");

  if (male && female) {
    const maleLabel = formatHourRange(male);
    const femaleLabel = formatHourRange(female);
    const isOpen = isRowOpenNow(male) || isRowOpenNow(female);
    return {
      label: `آقایان ${maleLabel} · بانوان ${femaleLabel}`,
      isOpen,
    };
  }

  const row = shared ?? male ?? female ?? rows[0];
  if (!row) {
    return { label: "ساعات کاری نامشخص", isOpen: true };
  }
  if (row.status === "closed") {
    return { label: "تعطیل", isOpen: false };
  }
  return { label: formatHourRange(row), isOpen: isRowOpenNow(row) };
}

function mapAmenities(
  amenities: DiscoveryClubPayload["amenities"],
): ClubDetailAmenity[] {
  return (amenities ?? []).map((item, index) => {
    const slug = (item.slug ?? item.icon ?? "").toLowerCase();
    const iconKey = AMENITY_ICON_BY_SLUG[slug] ?? "wifi";
    return {
      id: item.id ?? item.amenityId ?? `amenity-${index}`,
      title: item.name ?? "امکانات",
      subtitle: item.description ?? undefined,
      iconKey,
    };
  });
}

function mapSports(sports: DiscoveryClubPayload["sports"]): ClubDetailSport[] {
  return (sports ?? []).map((sport, index) => ({
    id: sport.id ?? sport.sportId ?? `sport-${index}`,
    title: sport.name ?? "رشته",
    subtitle: sport.description ?? "",
    backgroundImage: mediaFileUrl(sport.coverMediaId) ?? undefined,
  }));
}

function mapEquipment(
  equipments: DiscoveryClubPayload["equipments"],
): ClubDetailEquipment[] {
  return (equipments ?? []).map((item, index) => ({
    id: item.id ?? item.equipmentId ?? `equipment-${index}`,
    title: item.name ?? "تجهیزات",
    subtitle: item.description ?? undefined,
  }));
}

function mapCoaches(
  coaches: DiscoveryClubPayload["coaches"],
): ClubDetailCoach[] {
  return (coaches ?? []).map((coach, index) => ({
    id: coach.coachId,
    name: displayName(coach.name),
    image: mediaFileUrl(coach.avatar?.mediaId) ?? PLACEHOLDER_IMAGE,
    priceLabel: "",
    specialtyLabel: "",
    distanceLabel: "",
    rating: 0,
    ratingCount: 0,
    availability: "in-person" as const,
    isCertified: true,
    isNew: index === 0,
  }));
}

function mapBranches(branches: BranchLike[]): ClubDetailBranch[] {
  return branches.map((branch) => ({
    id: branch.id,
    title: branch.identity.name,
    subtitle: branch.location?.address,
    image:
      mediaFileUrl(branch.identity.coverMediaId) ??
      mediaFileUrl(branch.gallery[0]?.mediaId) ??
      PLACEHOLDER_IMAGE,
  }));
}

function mapReviews(reviews: ClubUserReview[]): ClubDetailReview[] {
  return reviews.map((review) => ({
    id: review.id,
    title: "کاربر",
    content: review.comment ?? "",
    date: review.createdAt
      ? new Date(review.createdAt).toLocaleDateString("fa-IR")
      : "",
    rating: review.rating,
    isVerified: review.status === "approved",
  }));
}

function mapGallery(club: DiscoveryClubPayload): ClubDetailGalleryItem[] {
  const cover = mediaFileUrl(club.identity.coverMediaId);
  const items: ClubDetailGalleryItem[] = [];
  if (cover) {
    items.push({
      url: cover,
      title: club.identity.name,
      description: club.identity.description ?? undefined,
    });
  }
  for (const item of club.gallery) {
    const url = mediaFileUrl(item.mediaId);
    if (!url) continue;
    items.push({
      url,
      title: item.title ?? undefined,
      description: item.description ?? undefined,
      views: item.views,
      createdAt: item.createdAt ?? undefined,
    });
  }
  const resolved =
    items.length > 0
      ? items
      : [{ url: PLACEHOLDER_IMAGE, title: club.identity.name }];
  return resolved.map((item, index) => withGalleryCardDefaults(item, index));
}

export function mapDiscoveryClubToDetail(input: {
  club: DiscoveryClubPayload;
  branches?: BranchLike[];
  classes?: ClubClass[];
  calendar?: ClubCalendarResponse | null;
  reviews?: ClubUserReview[];
  membershipPlans?: ClubMembershipPlan[];
}): ClubDetail {
  const { club } = input;
  const gallery = mapGallery(club);
  const images = gallery.map((item) => item.url);

  const hours = formatOpenHours(club.operatingHours);
  const ancestors =
    club.location?.node?.ancestors ?? club.location?.ancestors ?? [];
  const ancestorKind = (a: { kind?: string; level?: string }) =>
    a.kind ?? a.level;
  const province =
    ancestors.find((a) => ancestorKind(a) === "province")?.name ??
    ancestors[ancestors.length - 1]?.name;
  const city =
    ancestors.find((a) => ancestorKind(a) === "city")?.name ??
    club.location?.node?.name;
  const neighborhood =
    ancestors.find(
      (a) =>
        ancestorKind(a) === "district" || ancestorKind(a) === "neighborhood",
    )?.name ?? club.location?.node?.name;
  const locationLabel =
    club.location?.address ||
    [province, city, neighborhood].filter(Boolean).join("، ") ||
    "موقعیت نامشخص";

  const subscriptions: ClubDetailSubscription[] = (
    input.membershipPlans ?? []
  ).map((plan) => ({
    id: plan.id,
    planName: plan.name,
    description:
      plan.description ??
      (plan.sessionsTotal
        ? `${plan.sessionsTotal} جلسه`
        : plan.entriesTotal
          ? `${plan.entriesTotal} ورود`
          : plan.durationDays
            ? `${plan.durationDays} روز`
            : undefined),
    price: plan.pricing?.amount ?? 0,
  }));

  const cheapest = subscriptions
    .filter((plan) => plan.price > 0)
    .sort((a, b) => a.price - b.price)[0];

  const point = club.location?.point;
  const route = point
    ? [
        { lat: point.lat, lng: point.lng },
        { lat: point.lat + 0.002, lng: point.lng + 0.002 },
      ]
    : [{ lat: 35.7, lng: 51.4 }];

  const ownerName = displayName(club.owner?.name);

  return {
    id: club.id,
    title: club.identity.name,
    location: locationLabel,
    openHoursLabel: hours.label,
    isOpen: hours.isOpen,
    images,
    gallery,
    stats: [
      {
        labelKey: "distance",
        value: "—",
      },
      {
        labelKey: "score",
        value: String(club.reviewsSummary.average.toFixed(1)),
      },
      {
        labelKey: "students",
        value: "—",
      },
    ],
    overview: club.identity.description ?? "",
    pricePrefix: "از",
    price: cheapest ? String(cheapest.price) : "—",
    priceSuffix: "تومان",
    subscriptions,
    amenities: mapAmenities(club.amenities),
    sports: mapSports(club.sports),
    equipment: mapEquipment(club.equipments),
    coaches: mapCoaches(club.coaches),
    locationCard: {
      title: "مسیر باشگاه",
      province,
      city,
      neighborhood,
      address: club.location?.address,
      route,
      startLabel: "شروع",
      endLabel: "پایان",
    },
    branches: mapBranches(input.branches ?? []),
    classes: (input.classes ?? []).map((cls) =>
      mapDiscoveryClassToPreview(cls, input.calendar),
    ),
    reviews: mapReviews(input.reviews ?? []),
    busyHours: [],
    phones: (club.contact?.phones ?? []).map((phone, index) => ({
      id: `phone-${index}`,
      number: phone.number,
      label: phone.label ?? undefined,
    })),
    operatingHours: club.operatingHours.map((row) => ({
      weekday: row.weekday,
      status: row.status,
      audience: resolveAudience(row.audience),
      open: row.open,
      close: row.close,
    })),
    rules: (club.rules ?? []).map((rule, index) => ({
      id: `rule-${index}`,
      policy: rule.policy,
      title: rule.title,
      description: rule.description ?? undefined,
    })),
    categories: (club.categories ?? []).map((category, index) => ({
      id: category.id ?? category.categoryId ?? `category-${index}`,
      title: category.name ?? "دسته",
    })),
    achievements: (club.achievements ?? []).map((item, index) => ({
      id: item.id ?? item.achievementId ?? `achievement-${index}`,
      title: item.title ?? item.name ?? "دستاورد",
      color: "accent" as const,
    })),
    faq: (club.faq ?? []).map((item, index) => ({
      id: `faq-${index}`,
      title: item.title,
      description: item.description,
    })),
    audience: {
      genderPolicy: club.audience?.genderPolicy ?? undefined,
      ageGroupKeys: club.audience?.ageGroupKeys ?? [],
      levelKeys: club.audience?.levelKeys ?? [],
      accessibility: club.audience?.accessibility ?? "standard",
    },
    owner: club.owner
      ? {
          id: club.owner.id ?? "owner",
          name: ownerName === "مربی" ? "مالک باشگاه" : ownerName,
          avatar: mediaFileUrl(club.owner.avatar?.mediaId) ?? undefined,
          headline: "مالک باشگاه",
          rank: 1,
        }
      : undefined,
  };
}
