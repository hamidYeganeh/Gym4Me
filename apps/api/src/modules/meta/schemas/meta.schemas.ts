import { z } from "zod";
import { ACTIVE_INACTIVE_STATUSES } from "../../../common/enums/index.js";
import {
  CONFIGURATION_RESOURCES,
  CONFIGURATION_STATUSES,
  SPORT_LEVELS,
} from "../enums/index.js";

const labels = z.record(z.string(), z.string());
const json = z.record(z.string(), z.unknown());
export const configurationResourceSchema = z.enum(CONFIGURATION_RESOURCES);
export const configurationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().max(100).optional(),
  status: z.enum(CONFIGURATION_STATUSES).optional(),
  entity_type_id: z.string().length(24).optional(),
  taxonomy_id: z.string().length(24).optional(),
});
export const configurationBodySchema = z
  .record(z.string(), z.unknown())
  .refine((value) => Object.keys(value).length > 0, "حداقل یک فیلد لازم است.");
export const sportLevelSchema = z.enum(SPORT_LEVELS);
export const sportTermCreateSchema = z.object({
  code: z
    .string()
    .regex(/^[a-z][a-z0-9_]*$/)
    .min(2)
    .max(80),
  level: sportLevelSchema,
  parent_id: z.string().length(24).optional(),
  label_fa: z.string().min(2).max(120),
  label_en: z.string().min(2).max(120).optional(),
  icon: z.string().max(80).optional(),
  display_order: z.number().int().min(0).max(10_000).optional(),
});
export const sportTermPatchSchema = z
  .object({
    label_fa: z.string().min(2).max(120).optional(),
    label_en: z.string().min(2).max(120).optional(),
    icon: z.string().max(80).nullable().optional(),
    display_order: z.number().int().min(0).max(10_000).optional(),
    status: z.enum(ACTIVE_INACTIVE_STATUSES).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "حداقل یک مقدار باید تغییر کند.");

export { labels, json };
