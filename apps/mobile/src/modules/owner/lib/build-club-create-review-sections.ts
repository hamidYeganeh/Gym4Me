import type { RefItem, SportNode } from "@repo/api";
import type { DisclosureCardCollection } from "@repo/ui/cards/DisclosureCard";
import {
  createEmptyClubCreateLocation,
  hoursForAudience,
  SOCIAL_PLATFORM_OPTIONS,
  WEEKDAY_KEYS,
  type ClubCreateCatalogSelectionDraft,
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
  const mapCatalogCollection = (
    key: string,
    title: string,
    selections: ClubCreateCatalogSelectionDraft[],
    catalog: Array<{ id: string; name: string; icon?: string | null }>,
    withQuantity = false,
  ): DisclosureCardCollection => {
    const catalogById = new Map(catalog.map((item) => [item.id, item]));
    return {
      id: key,
      name: title,
      emptyLabel: t("reviewEmptyCatalog"),
      items: (selections ?? []).map((selection) => {
        const item = catalogById.get(selection.id);
        const quantityDetail =
          withQuantity && selection.quantity
            ? t("catalogQuantityValue", { count: selection.quantity })
            : undefined;
        const detail = selection.description.trim() || quantityDetail;
        return {
          id: selection.id,
          name: item?.name ?? selection.id,
          icon: item?.icon || "Sparkle1",
          detail,
        };
      }),
    };
  };

  const loc = values.location ?? createEmptyClubCreateLocation();
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
        phones.length || socials.length ? undefined : t("reviewEmptyPhones"),
    },
    {
      key: "location",
      title: t("stepLocation"),
      fields: [
        {
          key: "country",
          label: t("country"),
          value: loc.country.trim(),
        },
        {
          key: "province",
          label: t("province"),
          value: loc.province.trim(),
        },
        {
          key: "city",
          label: t("city"),
          value: loc.city.trim(),
        },
        {
          key: "district",
          label: t("district"),
          value: loc.district.trim(),
        },
        {
          key: "address",
          label: t("address"),
          value: loc.address.trim(),
        },
        {
          key: "lat",
          label: t("latitude"),
          value: loc.point ? loc.point.lat.toFixed(6) : "",
        },
        {
          key: "lng",
          label: t("longitude"),
          value: loc.point ? loc.point.lng.toFixed(6) : "",
        },
      ],
    },
    {
      key: "catalog",
      title: t("stepReview"),
      collections: [
        mapCatalogCollection(
          "categories",
          t("stepCategories"),
          values.categories ?? [],
          categories,
        ),
        mapCatalogCollection(
          "sports",
          t("stepSports"),
          values.sports ?? [],
          sports,
        ),
        mapCatalogCollection(
          "amenities",
          t("stepAmenities"),
          values.amenities ?? [],
          amenities,
        ),
        mapCatalogCollection(
          "equipment",
          t("stepEquipment"),
          values.equipment ?? [],
          equipment,
          true,
        ),
      ],
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
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    icon: item.icon,
  }));
}

export function mapSportOptions(items: SportNode[]) {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    icon: item.icon,
  }));
}
