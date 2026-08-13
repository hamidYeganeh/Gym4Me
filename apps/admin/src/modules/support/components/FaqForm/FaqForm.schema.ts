import { z } from "zod";
import type { AdminFaqItem, FaqAudience, PublishStatus } from "@repo/api";
import { FAQ_AUDIENCES, PUBLISH_STATUSES } from "../../lib/support-constants";

export type FaqFormMessages = {
  required: string;
};

const audienceSchema = z.custom<FaqAudience>(
  (value) =>
    typeof value === "string" && (FAQ_AUDIENCES as string[]).includes(value),
);
const publishStatusSchema = z.custom<PublishStatus>(
  (value) =>
    typeof value === "string" && (PUBLISH_STATUSES as string[]).includes(value),
);

export function createFaqFormSchema(messages: FaqFormMessages) {
  return z.object({
    question: z.string().trim().min(1, messages.required),
    answer: z.string().trim().min(1, messages.required),
    audience: audienceSchema,
    publishStatus: publishStatusSchema,
    order: z.string(),
  });
}

export type FaqFormValues = z.infer<ReturnType<typeof createFaqFormSchema>>;

export const faqFormDefaults: FaqFormValues = {
  question: "",
  answer: "",
  audience: "all",
  publishStatus: "draft",
  order: "0",
};

export function faqToFormValues(item: AdminFaqItem): FaqFormValues {
  return {
    question: item.question,
    answer: item.answer,
    audience: item.audience,
    publishStatus: item.publishStatus,
    order: String(item.order),
  };
}
