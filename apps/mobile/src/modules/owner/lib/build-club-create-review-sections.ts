import type { RefItem, SportNode } from "@repo/api";
import {
  AGE_GROUP_OPTIONS,
  hoursForAudience,
  SOCIAL_PLATFORM_OPTIONS,
  WEEKDAY_KEYS,
  type ClubCreateFormState,
} from "@/modules/owner/lib/club-create-form";
import type { OwnerClubsCreateReviewSectionBlock } from "@/modules/owner/sections/OwnerClubsCreateReviewSection";

type BuildClubCreateReviewSectionsInput = {
  values: ClubCreateFormState;
  categories: RefItem[];
  amenities: RefItem[];
  equipment: RefItem[];
  sports: SportNode[];
  t: (key: string, values?: Record<string, string | number>) => string;
};

export function buildClubCreateReviewSections({
  values,
  categories,
  amenities,
  equipment,
  sports,
  t,
}: BuildClubCreateReviewSectionsInput): OwnerClubsCreateReviewSectionBlock[] {
  const categoryMap = new Map(categories.map((item) => [item.id, item.name]));
  const amenityMap = new Map(amenities.map((item) => [item.id, item.name]));
  const equipmentMap = new Map(equipment.map((item) => [item.id, item.name]));
  const sportMap = new Map(sports.map((item) => [item.id, item.name]));

  const resolveNames = (ids: string[], map: Map<string, string>) =>
    ids.map((id) => map.get(id) ?? id).filter(Boolean);

  const genderLabel =
    values.genderPolicy === "male_only"
      ? t("genderMaleOnly")
      : values.genderPolicy === "female_only"
        ? t("genderFemaleOnly")
        : t("genderMixed");

  const ageChips = (values.ageGroupKeys ?? []).map((key) => {
    if (key === "kids") return t("ageKids");
    if (key === "teens") return t("ageTeens");
    if (key === "adults") return t("ageAdults");
    if (key === "seniors") return t("ageSeniors");
    return key;
  });

  const hoursModeLabel =
    values.hoursMode === "gender_split"
      ? t("hoursModeGenderSplit")
      : t("hoursModeUnified");

  const formatHourRows = (audience: "shared" | "male" | "female") =>
    hoursForAudience(values.operatingHours ?? [], audience).map((hour) => {
      const dayKey = WEEKDAY_KEYS[hour.weekday] ?? "sat";
      return {
        key: `${audience}-${hour.weekday}`,
        day: t(`weekdays.${dayKey}`),
        value:
          hour.status === "closed"
            ? t("dayClosed")
            : `${hour.open} – ${hour.close}`,
      };
    });

  const isSplit =
    values.genderPolicy === "mixed" && values.hoursMode === "gender_split";
  const hourGroups = isSplit
    ? [
        {
          key: "male",
          title: t("hoursAudienceMale"),
          rows: formatHourRows("male"),
        },
        {
          key: "female",
          title: t("hoursAudienceFemale"),
          rows: formatHourRows("female"),
        },
      ]
    : [
        {
          key: "shared",
          title: t("operatingHours"),
          rows: formatHourRows("shared"),
        },
      ];

  const phones = (values.phones ?? []).filter((phone) => phone.number.trim());
  const socials = (values.socials ?? []).filter(
    (social) => social.platform.trim() && social.url.trim(),
  );
  const rules = (values.rules ?? []).filter((rule) => rule.title.trim());
  const mediaItems = [
    ...(values.coverMediaId
      ? [
          {
            key: "cover",
            mediaId: values.coverMediaId,
            fileName: values.coverFileName || "cover.jpg",
            label: t("cover"),
          },
        ]
      : []),
    ...(values.gallery ?? []).map((item) => ({
      key: item.id,
      mediaId: item.mediaId,
      fileName: item.fileName || "gallery.jpg",
      label: t("gallery"),
    })),
  ];

  const socialPlatformLabel = (platform: string) => {
    if ((SOCIAL_PLATFORM_OPTIONS as readonly string[]).includes(platform)) {
      return t(
        `socialPlatforms.${platform as (typeof SOCIAL_PLATFORM_OPTIONS)[number]}`,
      );
    }
    return platform;
  };

  return [
    {
      key: "identity",
      title: t("stepIdentity"),
      fields: [
        {
          key: "name",
          label: t("name"),
          value: (values.name ?? "").trim(),
        },
        {
          key: "description",
          label: t("description"),
          value: (values.description ?? "").trim(),
        },
      ],
    },
    {
      key: "contact",
      title: t("stepContact"),
      fields: [
        {
          key: "website",
          label: t("website"),
          value: (values.website ?? "").trim(),
        },
      ],
      list: [
        ...phones.map((phone, index) => ({
          key: phone.id || `phone-${index}`,
          primary: phone.number.trim(),
          secondary: phone.label.trim() || undefined,
          meta: t("phone"),
        })),
        ...socials.map((social, index) => ({
          key: social.id || `social-${index}`,
          primary: socialPlatformLabel(social.platform),
          secondary: social.url.trim(),
          meta: t("socials"),
        })),
      ],
      emptyLabel:
        phones.length || socials.length || (values.website ?? "").trim()
          ? undefined
          : t("reviewEmptyPhones"),
    },
    {
      key: "location",
      title: t("stepLocation"),
      fields: [
        {
          key: "address",
          label: t("address"),
          value: (values.address ?? "").trim(),
        },
        {
          key: "lat",
          label: t("latitude"),
          value: values.point ? values.point.lat.toFixed(6) : "",
        },
        {
          key: "lng",
          label: t("longitude"),
          value: values.point ? values.point.lng.toFixed(6) : "",
        },
      ],
    },
    {
      key: "categories",
      title: t("stepCategories"),
      chips: resolveNames(values.categoryIds ?? [], categoryMap),
      emptyLabel: t("reviewEmptyCatalog"),
    },
    {
      key: "sports",
      title: t("stepSports"),
      chips: resolveNames(values.sportIds ?? [], sportMap),
      emptyLabel: t("reviewEmptyCatalog"),
    },
    {
      key: "amenities",
      title: t("stepAmenities"),
      chips: resolveNames(values.amenityIds ?? [], amenityMap),
      emptyLabel: t("reviewEmptyCatalog"),
    },
    {
      key: "equipment",
      title: t("stepEquipment"),
      chips: resolveNames(values.equipmentIds ?? [], equipmentMap),
      emptyLabel: t("reviewEmptyCatalog"),
    },
    {
      key: "media",
      title: t("stepMedia"),
      media: mediaItems,
      emptyLabel: t("reviewEmptyMedia"),
    },
    {
      key: "hours",
      title: t("stepHours"),
      fields: [
        {
          key: "gender",
          label: t("genderPolicy"),
          value: genderLabel,
        },
        {
          key: "hoursMode",
          label: t("hoursMode"),
          value: hoursModeLabel,
        },
        {
          key: "ages",
          label: t("ageGroups"),
          value: ageChips.join("، "),
        },
      ],
      hourGroups,
      emptyLabel: t("reviewEmptyHours"),
    },
    {
      key: "rules",
      title: t("stepRules"),
      list: rules.map((rule) => ({
        key: rule.id,
        primary: rule.title.trim(),
        secondary: rule.description.trim() || undefined,
        meta: rule.policy === "allowed" ? t("ruleAllowed") : t("ruleForbidden"),
      })),
      emptyLabel: t("reviewEmptyRules"),
    },
  ];
}

export function mapRefOptions(items: RefItem[]) {
  return items.map((item) => ({ id: item.id, name: item.name }));
}

export function mapSportOptions(items: SportNode[]) {
  return items.map((item) => ({ id: item.id, name: item.name }));
}
