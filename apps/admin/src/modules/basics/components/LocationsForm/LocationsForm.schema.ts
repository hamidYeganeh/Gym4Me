import { z } from "zod";
import type { LocationNode } from "@repo/api";

export type LocationsFormMessages = {
  required: string;
  coordinates: string;
};

export function createLocationsFormSchema(
  messages: LocationsFormMessages,
  options: { showCoordinates: boolean },
) {
  return z
    .object({
      name: z.string().trim().min(1, messages.required),
      slug: z.string(),
      description: z.string(),
      icon: z.string(),
      flagSvg: z.string(),
      coverMediaId: z.string().nullable(),
      lat: z.string(),
      lng: z.string(),
      parentId: z.string(),
      order: z.string(),
      isActive: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (!options.showCoordinates) return;
      const latValue = values.lat.trim();
      const lngValue = values.lng.trim();
      if (!latValue && !lngValue) return;
      const parsedLat = Number(latValue);
      const parsedLng = Number(lngValue);
      if (
        !Number.isFinite(parsedLat) ||
        !Number.isFinite(parsedLng) ||
        parsedLat < -90 ||
        parsedLat > 90 ||
        parsedLng < -180 ||
        parsedLng > 180
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["lat"],
          message: messages.coordinates,
        });
      }
    });
}

export type LocationsFormValues = z.infer<
  ReturnType<typeof createLocationsFormSchema>
>;

export const locationsFormDefaults: LocationsFormValues = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  flagSvg: "",
  coverMediaId: null,
  lat: "",
  lng: "",
  parentId: "",
  order: "0",
  isActive: true,
};

export function parseCoordinates(values: LocationsFormValues) {
  const latValue = values.lat.trim();
  const lngValue = values.lng.trim();
  if (!latValue && !lngValue) return null;
  return { lat: Number(latValue), lng: Number(lngValue) };
}

export function locationToFormValues(item: LocationNode): LocationsFormValues {
  return {
    name: item.name,
    slug: item.slug,
    description: item.description ?? "",
    icon: item.icon ?? "",
    flagSvg: item.flagSvg ?? "",
    coverMediaId: item.coverMediaId,
    lat: item.coordinates != null ? String(item.coordinates.lat) : "",
    lng: item.coordinates != null ? String(item.coordinates.lng) : "",
    parentId: item.parentId ?? "",
    order: String(item.order ?? 0),
    isActive: item.isActive,
  };
}
