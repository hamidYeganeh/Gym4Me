import { z } from "zod";
import type { PlatformPlan } from "@repo/api";

export type PlatformPlansFormMessages = { required: string };

export function createPlatformPlansFormSchema(
  messages: PlatformPlansFormMessages,
  isEdit: boolean,
) {
  return z.object({
    code: isEdit ? z.string() : z.string().trim().min(1, messages.required),
    name: z.string().trim().min(1, messages.required),
    description: z.string(),
    amount: z.string(),
    periodDays: z.string(),
    features: z.string(),
  });
}

export type PlatformPlansFormValues = z.infer<
  ReturnType<typeof createPlatformPlansFormSchema>
>;

export const platformPlansFormDefaults: PlatformPlansFormValues = {
  code: "",
  name: "",
  description: "",
  amount: "0",
  periodDays: "30",
  features: "",
};

export function planToFormValues(item: PlatformPlan): PlatformPlansFormValues {
  return {
    code: item.code,
    name: item.name,
    description: item.description ?? "",
    amount: String(item.pricing.amount),
    periodDays: String(item.pricing.periodDays ?? 30),
    features: (item.features ?? []).join("; "),
  };
}

export function parseFeatures(value: string) {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}
