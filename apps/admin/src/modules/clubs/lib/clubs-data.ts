import type {
  AdminCreateClubInput,
  Club,
  ClubUserReview,
  GeoDirection,
  Paginated,
} from "@repo/api";

/** Live `/admin/clubs` by default; flip via `VITE_CLUBS_USE_MOCK=true` for offline demos. */
export const CLUBS_USE_MOCK =
  String(import.meta.env.VITE_CLUBS_USE_MOCK ?? "false").toLowerCase() ===
  "true";

export type MockClubOwner = {
  id: string;
  name: string;
  phone: string;
};

export const MOCK_CLUB_OWNERS: MockClubOwner[] = [
  {
    id: "665f0a1b2c3d4e5f67890101",
    name: "سارا محمدی",
    phone: "09121234567",
  },
  {
    id: "665f0a1b2c3d4e5f67890102",
    name: "علی رضایی",
    phone: "09129876543",
  },
  {
    id: "665f0a1b2c3d4e5f67890103",
    name: "مریم کریمی",
    phone: "09351234567",
  },
];

export const MOCK_CLUB_CATEGORIES = [
  { id: "665f0cat0000000000000001", name: "بدنسازی", slug: "gym" },
  { id: "665f0cat0000000000000002", name: "استخر", slug: "pool" },
  { id: "665f0cat0000000000000003", name: "فوتبال", slug: "football" },
  { id: "665f0cat0000000000000004", name: "مجموعه ورزشی", slug: "multi-sport" },
] as const;

export const MOCK_CLUB_SPORTS = [
  { id: "665f0spt0000000000000001", name: "بدنسازی" },
  { id: "665f0spt0000000000000002", name: "شنا" },
  { id: "665f0spt0000000000000003", name: "فوتبال" },
] as const;

export type ClubsCreateFormMockDefaults = {
  ownerId: string;
  name: string;
  description: string;
  phone: string;
  phoneLabel: string;
  website: string;
  address: string;
  direction: GeoDirection;
  categoryIds: string[];
  sportIds: string[];
  genderPolicy?: string;
  accessibility?: string;
  ageGroupKeys?: string[];
  levelKeys?: string[];
};

/** Prefill values for the admin create-club drawer. */
export const clubsCreateFormMockDefaults: ClubsCreateFormMockDefaults = {
  ownerId: MOCK_CLUB_OWNERS[0].id,
  name: "باشگاه آسمانی",
  description:
    "مجموعه ورزشی کامل با سالن بدنسازی، استخر و کلاس‌های گروهی در شمال تهران.",
  phone: "02188776655",
  phoneLabel: "رزرو",
  website: "https://asemani.example.com",
  address: "تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۱۲",
  direction: "north",
  categoryIds: [
    MOCK_CLUB_CATEGORIES[0].id,
    MOCK_CLUB_CATEGORIES[3].id,
  ],
  sportIds: [MOCK_CLUB_SPORTS[0].id, MOCK_CLUB_SPORTS[1].id],
};

function emptyReviewsSummary(): Club["reviewsSummary"] {
  return {
    count: 0,
    average: 0,
    distribution: [
      { star: 5, count: 0 },
      { star: 4, count: 0 },
      { star: 3, count: 0 },
      { star: 2, count: 0 },
      { star: 1, count: 0 },
    ],
    criteria: [],
  };
}

function baseClub(
  overrides: Partial<Club> &
    Pick<Club, "id" | "ownerId" | "identity"> & {
      identity: Club["identity"];
    },
): Club {
  const now = new Date().toISOString();
  return {
    parentClubId: null,
    contact: { phones: [], website: null },
    gallery: [],
    cancellation: { rules: [], peakRules: [] },
    equipments: [],
    amenities: [],
    categories: [],
    sports: [],
    classes: [],
    coaches: [],
    location: null,
    audience: {
      genderPolicy: "mixed",
      ageGroupKeys: [],
      levelKeys: [],
      accessibility: "standard",
    },
    reviewsSummary: emptyReviewsSummary(),
    operatingHours: [],
    socials: [],
    achievements: [],
    rules: [],
    faq: [],
    review: {
      status: "draft",
      submittedAt: null,
      reviewedAt: null,
      reviewNote: null,
      documentMediaIds: [],
    },
    operationalStatus: "active",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export const MOCK_CLUBS: Club[] = [
  baseClub({
    id: "665f0club000000000000001",
    ownerId: MOCK_CLUB_OWNERS[0].id,
    identity: {
      name: "باشگاه آسمانی",
      description: "سالن بدنسازی و کراس‌فیت با مربیان حرفه‌ای.",
      coverMediaId: null,
    },
    contact: {
      phones: [
        { number: "02188776655", label: "رزرو" },
        { number: "09121234567", label: "مدیریت" },
      ],
      website: "https://asemani.example.com",
    },
    categories: [{ id: MOCK_CLUB_CATEGORIES[0].id, name: MOCK_CLUB_CATEGORIES[0].name }],
    sports: [{ id: MOCK_CLUB_SPORTS[0].id, name: MOCK_CLUB_SPORTS[0].name }],
    coaches: [{ coachId: "665f0coach00000000000001" }],
    location: {
      address: "تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۱۲",
      point: { lng: 51.375, lat: 35.787 },
      direction: "north",
      locationId: "665f0loc0000000000000001",
      ancestors: ["665f0loc0000000000000000"],
    },
    reviewsSummary: {
      count: 48,
      average: 4.7,
      distribution: [
        { star: 5, count: 32 },
        { star: 4, count: 12 },
        { star: 3, count: 3 },
        { star: 2, count: 1 },
        { star: 1, count: 0 },
      ],
      criteria: [
        { criterionId: "665f0crit000000000000001", average: 4.8 },
        { criterionId: "665f0crit000000000000002", average: 4.6 },
      ],
    },
    review: {
      status: "approved",
      submittedAt: "2026-07-01T10:00:00.000Z",
      reviewedAt: "2026-07-02T12:00:00.000Z",
      reviewNote: null,
      documentMediaIds: [],
    },
    operationalStatus: "active",
    socials: [{ platform: "instagram", url: "https://instagram.com/asemani" }],
    rules: [
      {
        policy: "forbidden",
        title: "کفش بیرونی ممنوع",
        description: "فقط کفش ورزشی تمیز مجاز است.",
      },
    ],
    faq: [
      {
        title: "ساعت کاری؟",
        description: "هر روز از ۶ صبح تا ۱۱ شب.",
      },
    ],
    createdAt: "2026-06-15T08:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z",
  }),
  baseClub({
    id: "665f0club000000000000002",
    ownerId: MOCK_CLUB_OWNERS[1].id,
    identity: {
      name: "استخر نیلوفر",
      description: "استخر استاندارد المپیک با سانس‌های آقایان و بانوان.",
      coverMediaId: null,
    },
    contact: {
      phones: [{ number: "02144556677", label: "پذیرش" }],
      website: null,
    },
    categories: [{ id: MOCK_CLUB_CATEGORIES[1].id, name: MOCK_CLUB_CATEGORIES[1].name }],
    sports: [{ id: MOCK_CLUB_SPORTS[1].id, name: MOCK_CLUB_SPORTS[1].name }],
    location: {
      address: "تهران، ونک، خیابان ملاصدرا",
      point: { lng: 51.405, lat: 35.757 },
      direction: "center",
      locationId: "665f0loc0000000000000002",
      ancestors: [],
    },
    reviewsSummary: {
      count: 21,
      average: 4.3,
      distribution: [
        { star: 5, count: 10 },
        { star: 4, count: 7 },
        { star: 3, count: 3 },
        { star: 2, count: 1 },
        { star: 1, count: 0 },
      ],
      criteria: [],
    },
    review: {
      status: "pending_review",
      submittedAt: "2026-08-04T14:30:00.000Z",
      reviewedAt: null,
      reviewNote: null,
      documentMediaIds: [],
    },
    operationalStatus: "active",
    createdAt: "2026-08-01T11:00:00.000Z",
    updatedAt: "2026-08-04T14:30:00.000Z",
  }),
  baseClub({
    id: "665f0club000000000000003",
    ownerId: MOCK_CLUB_OWNERS[2].id,
    identity: {
      name: "زمین فوتبال آفتاب",
      description: "زمین چمن مصنوعی استاندارد با نورپردازی شبانه.",
      coverMediaId: null,
    },
    contact: {
      phones: [{ number: "09351234567", label: null }],
      website: null,
    },
    categories: [{ id: MOCK_CLUB_CATEGORIES[2].id, name: MOCK_CLUB_CATEGORIES[2].name }],
    sports: [{ id: MOCK_CLUB_SPORTS[2].id, name: MOCK_CLUB_SPORTS[2].name }],
    location: {
      address: "تهران، تجریش، میدان قدس",
      point: { lng: 51.43, lat: 35.804 },
      direction: "north",
      locationId: null,
      ancestors: [],
    },
    review: {
      status: "draft",
      submittedAt: null,
      reviewedAt: null,
      reviewNote: null,
      documentMediaIds: [],
    },
    operationalStatus: "inactive",
    createdAt: "2026-08-05T16:00:00.000Z",
    updatedAt: "2026-08-05T16:00:00.000Z",
  }),
];

export const MOCK_CLUB_USER_REVIEWS: Record<string, ClubUserReview[]> = {
  "665f0club000000000000001": [
    {
      id: "665f0rev0000000000000001",
      clubId: "665f0club000000000000001",
      authorId: "665f0user000000000000001",
      bookingId: null,
      rating: 5,
      criteria: [
        { criterionId: "665f0crit000000000000001", rating: 5 },
        { criterionId: "665f0crit000000000000002", rating: 5 },
      ],
      comment: "نظافت عالی و کادر حرفه‌ای. حتماً دوباره می‌آیم.",
      status: "approved",
      reply: {
        text: "ممنون از لطف شما!",
        repliedAt: "2026-07-20T10:00:00.000Z",
        repliedBy: MOCK_CLUB_OWNERS[0].id,
      },
      createdAt: "2026-07-18T18:00:00.000Z",
      updatedAt: "2026-07-20T10:00:00.000Z",
    },
  ],
};

export function buildClubFromCreateInput(input: AdminCreateClubInput): Club {
  const id = `665f0club${Date.now().toString(16).padStart(12, "0")}`.slice(
    0,
    24,
  );
  const now = new Date().toISOString();
  return baseClub({
    id,
    ownerId: input.ownerId,
    identity: {
      name: input.identity.name.trim(),
      description: input.identity.description ?? null,
      coverMediaId: input.identity.coverMediaId ?? null,
    },
    contact: {
      phones: (input.contact?.phones ?? []).map((p) => ({
        number: p.number,
        label: p.label ?? null,
      })),
      website: input.contact?.website ?? null,
    },
    categories: (input.categoryIds ?? []).map((id) => ({
      id,
      name: MOCK_CLUB_CATEGORIES.find((c) => c.id === id)?.name,
    })),
    sports: (input.sportIds ?? []).map((id) => ({
      id,
      name: MOCK_CLUB_SPORTS.find((s) => s.id === id)?.name,
    })),
    classes: (input.classIds ?? []).map((classId) => ({ classId })),
    coaches: (input.coachIds ?? []).map((coachId) => ({ coachId })),
    location: input.location
      ? {
          address: input.location.address,
          point: input.location.point ?? null,
          direction: input.location.direction ?? null,
          locationId: input.location.locationId ?? null,
          ancestors: [],
        }
      : null,
    gallery: (input.gallery ?? []).map((g) => ({
      mediaId: g.mediaId,
      title: g.title ?? null,
      description: g.description ?? null,
    })),
    cancellation: {
      rules: input.cancellation?.rules ?? [],
      peakRules: input.cancellation?.peakRules ?? [],
    },
    operatingHours: input.operatingHours ?? [],
    socials: input.socials ?? [],
    rules: input.rules ?? [],
    faq: input.faq ?? [],
    createdAt: now,
    updatedAt: now,
  });
}

export function ownerLabel(ownerId: string): string {
  const owner = MOCK_CLUB_OWNERS.find((o) => o.id === ownerId);
  return owner ? `${owner.name} · ${owner.phone}` : ownerId.slice(-6);
}

export function categoryLabel(categoryId: string): string {
  return (
    MOCK_CLUB_CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId
  );
}

export type ClubListQuery = {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  lifecycleStatus?: string | readonly string[];
  operationalStatus?: string | readonly string[];
  sortBy?:
    | "name"
    | "ownerId"
    | "lifecycleStatus"
    | "operationalStatus"
    | "rating"
    | "createdAt";
  sortOrder?: "asc" | "desc";
};

export function filterMockClubs(
  items: Club[],
  query: ClubListQuery,
): Paginated<Club> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  let filtered = [...items];

  const search = query.search ?? query.q;
  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((c) =>
      c.identity.name.toLowerCase().includes(q),
    );
  }
  const lifecycleStatuses = query.lifecycleStatus
    ? Array.isArray(query.lifecycleStatus)
      ? query.lifecycleStatus
      : [query.lifecycleStatus]
    : [];
  if (lifecycleStatuses.length > 0) {
    filtered = filtered.filter(
      (c) => lifecycleStatuses.includes(c.review.status),
    );
  }
  const operationalStatuses = query.operationalStatus
    ? Array.isArray(query.operationalStatus)
      ? query.operationalStatus
      : [query.operationalStatus]
    : [];
  if (operationalStatuses.length > 0) {
    filtered = filtered.filter(
      (c) => operationalStatuses.includes(c.operationalStatus),
    );
  }

  const sortBy = query.sortBy ?? "createdAt";
  const direction = query.sortOrder === "asc" ? 1 : -1;
  filtered.sort((first, second) => {
    const values: Record<
      NonNullable<ClubListQuery["sortBy"]>,
      [string | number, string | number]
    > = {
      name: [first.identity.name, second.identity.name],
      ownerId: [first.ownerId, second.ownerId],
      lifecycleStatus: [first.review.status, second.review.status],
      operationalStatus: [
        first.operationalStatus,
        second.operationalStatus,
      ],
      rating: [
        first.reviewsSummary.average,
        second.reviewsSummary.average,
      ],
      createdAt: [first.createdAt, second.createdAt],
    };
    const [left, right] = values[sortBy];
    const compared =
      typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right));
    return compared === 0
      ? first.id.localeCompare(second.id) * direction
      : compared * direction;
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    pagination: {
      page,
      page_size: limit,
      next: page < totalPages ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
      total,
    },
    result: filtered.slice(start, start + limit),
  };
}
