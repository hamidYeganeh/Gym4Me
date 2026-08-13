import { z } from "zod";
import type { RefItem, RefStatus } from "@repo/api";

export const REF_STATUSES: RefStatus[] = ["approved", "pending"];

export type RefsFormMessages = { required: string };

const statusSchema = z.custom<RefStatus>(
  (value) =>
    typeof value === "string" && (REF_STATUSES as string[]).includes(value),
);

export function createRefsFormSchema(messages: RefsFormMessages) {
  return z.object({
    name: z.string().trim().min(1, messages.required),
    slug: z.string(),
    description: z.string(),
    icon: z.string(),
    coverMediaId: z.string().nullable(),
    order: z.string(),
    status: statusSchema,
    isActive: z.boolean(),
  });
}

export type RefsFormValues = z.infer<ReturnType<typeof createRefsFormSchema>>;

export const refsFormDefaults: RefsFormValues = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  coverMediaId: null,
  order: "0",
  status: "approved",
  isActive: true,
};

export function refToFormValues(item: RefItem): RefsFormValues {
  return {
    name: item.name,
    slug: item.slug,
    description: item.description ?? "",
    icon: item.icon ?? "",
    coverMediaId: item.coverMediaId,
    order: String(item.order ?? 0),
    status: item.status,
    isActive: item.isActive,
  };
}
