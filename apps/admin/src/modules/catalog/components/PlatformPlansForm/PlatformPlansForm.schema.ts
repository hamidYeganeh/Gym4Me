import { z } from "zod";
import type { PlatformEntitlementContract, PlatformPlan } from "@repo/api";

export type PlatformPlansFormMessages = { required: string };

export function createPlatformPlansFormSchema(
  messages: PlatformPlansFormMessages,
  isEdit: boolean,
) {
  const nonNegativeInteger = z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d+$/.test(value), messages.required);
  return z.object({
    code: isEdit ? z.string() : z.string().trim().min(1, messages.required),
    name: z.string().trim().min(1, messages.required),
    description: z.string(),
    amount: z.string().trim().regex(/^\d+$/, messages.required),
    tax: z.string().trim().regex(/^\d+$/, messages.required),
    periodDays: z.string().trim().regex(/^\d+$/, messages.required),
    features: z.string(),
    capabilities: z.string(),
    audience: z.enum(["club_owner", "coach"]),
    graceDays: z.string().trim().regex(/^\d+$/, messages.required),
    clubsLimit: nonNegativeInteger,
    staffLimit: nonNegativeInteger,
    membersLimit: nonNegativeInteger,
    messagesLimit: nonNegativeInteger,
    studentsLimit: nonNegativeInteger,
    contractReady: z.boolean(),
    postExpirationMode: z.enum(["free_plan", "read_only"]),
    fallbackPlanId: z.string(),
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
  tax: "0",
  periodDays: "30",
  features: "",
  capabilities: "",
  audience: "club_owner",
  graceDays: "7",
  clubsLimit: "1",
  staffLimit: "",
  membersLimit: "",
  messagesLimit: "",
  studentsLimit: "",
  contractReady: false,
  postExpirationMode: "read_only",
  fallbackPlanId: "",
};

export function planToFormValues(item: PlatformPlan): PlatformPlansFormValues {
  return {
    code: item.code,
    name: item.name,
    description: item.description ?? "",
    amount: String(item.pricing.amount),
    tax: String(item.pricing.tax ?? 0),
    periodDays: String(item.pricing.periodDays ?? 30),
    features: (item.features ?? []).join("; "),
    capabilities: (item.entitlementContract?.capabilities ?? []).join("; "),
    audience: item.entitlementContract?.audience ?? "club_owner",
    graceDays: String(item.entitlementContract?.graceDays ?? 7),
    clubsLimit: limitValue(item, "clubs.active"),
    staffLimit: limitValue(item, "staff.active_per_club"),
    membersLimit: limitValue(item, "members.active_per_club"),
    messagesLimit: limitValue(item, "monthly_messages.transactional"),
    studentsLimit: limitValue(item, "students.active"),
    contractReady: item.contractReady ?? false,
    postExpirationMode: item.postExpirationMode ?? "read_only",
    fallbackPlanId: item.fallbackPlanId ?? "",
  };
}

function limitValue(item: PlatformPlan, key: string) {
  const value = item.entitlementContract?.limits.find(
    (limit) => limit.key === key,
  )?.value;
  return value === null || value === undefined ? "" : String(value);
}

export function formValuesToEntitlement(
  values: PlatformPlansFormValues,
): PlatformEntitlementContract {
  const parseLimit = (value: string) =>
    value.trim() === "" ? null : Number.parseInt(value, 10);
  const limits: PlatformEntitlementContract["limits"] =
    values.audience === "coach"
      ? [
          {
            key: "students.active",
            value: parseLimit(values.studentsLimit),
            mode: "hard",
          },
        ]
      : [
          { key: "clubs.active", value: parseLimit(values.clubsLimit), mode: "hard" },
          { key: "staff.active_per_club", value: parseLimit(values.staffLimit), mode: "hard" },
          { key: "members.active_per_club", value: parseLimit(values.membersLimit), mode: "hard" },
          { key: "monthly_messages.transactional", value: parseLimit(values.messagesLimit), mode: "hard" },
        ];
  return {
    schemaVersion: 1,
    audience: values.audience,
    capabilities: parseFeatures(values.capabilities),
    limits,
    graceDays: Number.parseInt(values.graceDays, 10),
  };
}

export function parseFeatures(value: string) {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}
