import type {
  CreateClubInput,
  OperatingHourAudience,
  RulePolicy,
  WeekdayStatus,
} from "@repo/api";

export const CLUB_CREATE_STEP_COUNT = 11;

export type ClubCreateWizardStep =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10;

export type ClubCreateHourDraft = {
  weekday: number;
  status: WeekdayStatus;
  audience: OperatingHourAudience;
  open: string;
  close: string;
};

export type ClubCreateRuleDraft = {
  id: string;
  policy: RulePolicy;
  title: string;
  description: string;
};

export type ClubCreatePhoneDraft = {
  id: string;
  number: string;
  label: string;
};

export type ClubCreateSocialDraft = {
  id: string;
  platform: string;
  url: string;
};

export type ClubCreateGalleryDraft = {
  id: string;
  mediaId: string;
  fileName: string;
};

export type ClubCreateHoursMode = "unified" | "gender_split";

export type ClubCreateFormState = {
  name: string;
  description: string;
  coverMediaId: string | null;
  coverFileName: string;
  phones: ClubCreatePhoneDraft[];
  website: string;
  socials: ClubCreateSocialDraft[];
  address: string;
  point: { lat: number; lng: number } | null;
  categoryIds: string[];
  sportIds: string[];
  amenityIds: string[];
  equipmentIds: string[];
  gallery: ClubCreateGalleryDraft[];
  genderPolicy: string;
  ageGroupKeys: string[];
  /** When mixed: one shared schedule vs separate male/female schedules. */
  hoursMode: ClubCreateHoursMode;
  operatingHours: ClubCreateHourDraft[];
  rules: ClubCreateRuleDraft[];
};

export const GENDER_POLICY_OPTIONS = [
  "mixed",
  "male_only",
  "female_only",
] as const;

export const AGE_GROUP_OPTIONS = [
  "kids",
  "teens",
  "adults",
  "seniors",
] as const;

export const SOCIAL_PLATFORM_OPTIONS = [
  "instagram",
  "telegram",
  "whatsapp",
  "website",
  "x",
] as const;

/** Jalali week: 0 = Saturday … 6 = Friday. */
export const WEEKDAY_KEYS = [
  "sat",
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
] as const;

function createLocalId(prefix: string) {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultOperatingHours(
  audience: OperatingHourAudience = "shared",
): ClubCreateHourDraft[] {
  return WEEKDAY_KEYS.map((_, weekday) => ({
    weekday,
    status: "open" as const,
    audience,
    open: "08:00",
    close: "22:00",
  }));
}

export function createGenderSplitOperatingHours(): ClubCreateHourDraft[] {
  return [
    ...createDefaultOperatingHours("male").map((hour) => ({
      ...hour,
      open: "06:00",
      close: "14:00",
    })),
    ...createDefaultOperatingHours("female").map((hour) => ({
      ...hour,
      open: "14:00",
      close: "22:00",
    })),
  ];
}

export function hoursForAudience(
  hours: ClubCreateHourDraft[],
  audience: OperatingHourAudience,
): ClubCreateHourDraft[] {
  return hours
    .filter((hour) => hour.audience === audience)
    .sort((a, b) => a.weekday - b.weekday);
}

export function patchHourInList(
  hours: ClubCreateHourDraft[],
  weekday: number,
  audience: OperatingHourAudience,
  patch: Partial<Pick<ClubCreateHourDraft, "status" | "open" | "close">>,
): ClubCreateHourDraft[] {
  return hours.map((hour) =>
    hour.weekday === weekday && hour.audience === audience
      ? { ...hour, ...patch }
      : hour,
  );
}

export function resolveHoursMode(
  hours: ClubCreateHourDraft[],
): ClubCreateHoursMode {
  const hasGenderRows = hours.some(
    (hour) => hour.audience === "male" || hour.audience === "female",
  );
  return hasGenderRows ? "gender_split" : "unified";
}

export function applyHoursMode(
  current: ClubCreateHourDraft[],
  mode: ClubCreateHoursMode,
): ClubCreateHourDraft[] {
  if (mode === "unified") {
    const shared = hoursForAudience(current, "shared");
    if (shared.length === 7) return shared;
    const male = hoursForAudience(current, "male");
    const source = male.length === 7 ? male : current.slice(0, 7);
    return WEEKDAY_KEYS.map((_, weekday) => {
      const row = source.find((hour) => hour.weekday === weekday) ?? source[0];
      return {
        weekday,
        status: row?.status ?? ("open" as const),
        audience: "shared" as const,
        open: row?.open ?? "08:00",
        close: row?.close ?? "22:00",
      };
    });
  }

  const male = hoursForAudience(current, "male");
  const female = hoursForAudience(current, "female");
  if (male.length === 7 && female.length === 7) {
    return [...male, ...female];
  }

  const shared = hoursForAudience(current, "shared");
  const template =
    shared.length === 7 ? shared : createDefaultOperatingHours("shared");

  return [
    ...template.map((hour) => ({
      ...hour,
      audience: "male" as const,
      open: hour.open || "06:00",
      close: hour.close || "14:00",
    })),
    ...template.map((hour) => ({
      ...hour,
      audience: "female" as const,
      open: hour.open || "14:00",
      close: hour.close || "22:00",
    })),
  ];
}

export function applyGenderPolicyToHours(
  genderPolicy: string,
  current: ClubCreateHourDraft[],
): { hoursMode: ClubCreateHoursMode; operatingHours: ClubCreateHourDraft[] } {
  if (genderPolicy === "mixed") {
    const hoursMode = resolveHoursMode(current);
    return {
      hoursMode,
      operatingHours:
        hoursMode === "gender_split"
          ? applyHoursMode(current, "gender_split")
          : applyHoursMode(current, "unified"),
    };
  }

  return {
    hoursMode: "unified",
    operatingHours: applyHoursMode(current, "unified"),
  };
}

export function createPhoneDraft(
  partial?: Partial<Omit<ClubCreatePhoneDraft, "id">>,
): ClubCreatePhoneDraft {
  return {
    id: createLocalId("phone"),
    number: partial?.number ?? "",
    label: partial?.label ?? "",
  };
}

export function createSocialDraft(
  partial?: Partial<Omit<ClubCreateSocialDraft, "id">>,
): ClubCreateSocialDraft {
  return {
    id: createLocalId("social"),
    platform: partial?.platform ?? "instagram",
    url: partial?.url ?? "",
  };
}

export function createEmptyClubCreateForm(): ClubCreateFormState {
  return {
    name: "",
    description: "",
    coverMediaId: null,
    coverFileName: "",
    phones: [createPhoneDraft()],
    website: "",
    socials: [],
    address: "",
    point: null,
    categoryIds: [],
    sportIds: [],
    amenityIds: [],
    equipmentIds: [],
    gallery: [],
    genderPolicy: "mixed",
    ageGroupKeys: ["adults"],
    hoursMode: "unified",
    operatingHours: createDefaultOperatingHours("shared"),
    rules: [],
  };
}

export function toggleIdInList(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function createRuleDraft(
  partial?: Partial<Omit<ClubCreateRuleDraft, "id">>,
): ClubCreateRuleDraft {
  return {
    id: createLocalId("rule"),
    policy: partial?.policy ?? "forbidden",
    title: partial?.title ?? "",
    description: partial?.description ?? "",
  };
}

export function buildCreateClubPayload(
  form: ClubCreateFormState,
): CreateClubInput {
  const rules = form.rules
    .map((rule) => ({
      policy: rule.policy,
      title: rule.title.trim(),
      description: rule.description.trim() || undefined,
    }))
    .filter((rule) => rule.title.length > 0);

  const phones = form.phones
    .map((phone) => ({
      number: phone.number.trim(),
      label: phone.label.trim() || undefined,
    }))
    .filter((phone) => phone.number.length > 0);

  const website = form.website.trim();
  const hasContact = phones.length > 0 || Boolean(website);

  const socials = form.socials
    .map((social) => ({
      platform: social.platform.trim(),
      url: social.url.trim(),
    }))
    .filter((social) => social.platform.length > 0 && social.url.length > 0);

  const gallery = form.gallery.map((item) => ({
    mediaId: item.mediaId,
    title: null,
    description: null,
  }));

  const hours =
    form.genderPolicy === "mixed" && form.hoursMode === "gender_split"
      ? applyHoursMode(form.operatingHours, "gender_split")
      : applyHoursMode(form.operatingHours, "unified");

  const address = form.address.trim();
  const location =
    address || form.point
      ? {
          address: address || "—",
          point: form.point
            ? { lat: form.point.lat, lng: form.point.lng }
            : undefined,
        }
      : undefined;

  return {
    identity: {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      coverMediaId: form.coverMediaId || undefined,
    },
    contact: hasContact
      ? {
          phones: phones.length ? phones : undefined,
          website: website || undefined,
        }
      : undefined,
    location,
    gallery: gallery.length ? gallery : undefined,
    categoryIds: form.categoryIds.length ? form.categoryIds : undefined,
    sportIds: form.sportIds.length ? form.sportIds : undefined,
    amenityIds: form.amenityIds.length ? form.amenityIds : undefined,
    equipmentIds: form.equipmentIds.length ? form.equipmentIds : undefined,
    audience: {
      genderPolicy: form.genderPolicy || null,
      ageGroupKeys: form.ageGroupKeys,
    },
    operatingHours: hours.map((hour) =>
      hour.status === "closed"
        ? {
            weekday: hour.weekday,
            status: "closed" as const,
            audience: hour.audience,
          }
        : {
            weekday: hour.weekday,
            status: "open" as const,
            audience: hour.audience,
            open: hour.open,
            close: hour.close,
          },
    ),
    socials: socials.length ? socials : undefined,
    rules: rules.length ? rules : undefined,
  };
}
