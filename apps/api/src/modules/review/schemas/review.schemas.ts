import { z } from "zod";
import {
  MODERATION_DECISIONS,
  REPORT_REASONS,
  REVIEW_STATUSES,
  REVIEW_SUBJECTS,
} from "../enums/index.js";

export const objectId = z.string().regex(/^[0-9a-f]{24}$/i, "شناسه نامعتبر است.");
export const reviewCreateSchema = z.object({
  booking_id: objectId,
  subject: z.object({ type: z.enum(REVIEW_SUBJECTS), id: objectId }),
  rating: z.object({
    overall: z.number().int().min(1).max(5),
    dimensions: z
      .record(z.string().trim().min(1).max(60), z.number().int().min(1).max(5))
      .default({}),
  }),
  content: z.object({
    title: z.string().trim().max(120).optional(),
    body: z.string().trim().min(2).max(3000),
  }),
});
export const reviewPatchSchema = reviewCreateSchema.pick({ rating: true, content: true });
export const reviewQuerySchema = z
  .object({
    subject_type: z.enum(REVIEW_SUBJECTS).optional(),
    subject_id: objectId.optional(),
    status: z.enum(REVIEW_STATUSES).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .superRefine((value, ctx) => {
    if (Boolean(value.subject_type) !== Boolean(value.subject_id))
      ctx.addIssue({
        code: "custom",
        path: ["subject_id"],
        message: "نوع و شناسه موضوع باید با هم ارسال شوند.",
      });
  });
export const reviewReportSchema = z.object({
  reason: z.enum(REPORT_REASONS),
  note: z.string().trim().max(1000).optional(),
});
export const reviewReplySchema = z.object({ body: z.string().trim().min(2).max(2000) });
export const reviewModerationSchema = z.object({
  decision: z.enum(MODERATION_DECISIONS),
  note: z.string().trim().min(2).max(1000),
});
