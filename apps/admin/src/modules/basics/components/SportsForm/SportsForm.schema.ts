import { z } from "zod";
import type { SportNode } from "@repo/api";

export type SportsFormMessages = { required: string };

export function createSportsFormSchema(messages: SportsFormMessages) {
  return z.object({
    name: z.string().trim().min(1, messages.required),
    slug: z.string(),
    description: z.string(),
    icon: z.string(),
    coverMediaId: z.string().nullable(),
    parentId: z.string(),
    order: z.string(),
    isActive: z.boolean(),
  });
}

export type SportsFormValues = z.infer<
  ReturnType<typeof createSportsFormSchema>
>;

export const sportsFormDefaults: SportsFormValues = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  coverMediaId: null,
  parentId: "",
  order: "0",
  isActive: true,
};

export function sportToFormValues(item: SportNode): SportsFormValues {
  return {
    name: item.name,
    slug: item.slug,
    description: item.description ?? "",
    icon: item.icon ?? "",
    coverMediaId: item.coverMediaId,
    parentId: item.parentId ?? "",
    order: String(item.order ?? 0),
    isActive: item.isActive,
  };
}
