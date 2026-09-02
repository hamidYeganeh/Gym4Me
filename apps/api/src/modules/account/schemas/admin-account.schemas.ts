import { z } from "zod";
import { SCOPE_TYPES } from "../../../common/enums/index.js";
import {
  ASSIGNABLE_ROLE_TYPES,
  ROLE_STATUSES,
  USER_CREATE_STATUSES,
  USER_STATUSES,
} from "../enums/index.js";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "شناسه معتبر نیست");
export const adminUserListSchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(USER_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});
export const adminUserCreateSchema = z.object({
  mobile: z.string().trim().min(10).max(20),
  profile: z
    .object({ first_name: z.string().max(80).optional(), last_name: z.string().max(80).optional() })
    .default({}),
  status: z.enum(USER_CREATE_STATUSES).default("active"),
});
export const adminUserPatchSchema = z.object({
  status: z.enum(USER_STATUSES).optional(),
  profile: z
    .object({ first_name: z.string().max(80).optional(), last_name: z.string().max(80).optional() })
    .optional(),
});
export const roleSchema = z.object({
  code: z
    .string()
    .regex(/^[a-z][a-z0-9_.-]*$/)
    .max(80),
  name: z.string().trim().min(2).max(120),
  type: z.enum(ASSIGNABLE_ROLE_TYPES).default("custom"),
  scope_type: z.enum(SCOPE_TYPES),
  permissions: z.array(z.string().min(1).max(160)).max(300).default([]),
  status: z.enum(ROLE_STATUSES).default("active"),
});
export const rolePatchSchema = roleSchema.omit({ code: true }).partial();
export const assignmentSchema = z.object({
  user_id: objectId,
  role_id: objectId,
  scope: z.object({
    type: z.enum(SCOPE_TYPES),
    id: objectId.optional(),
  }),
  expires_at: z.coerce.date().optional(),
});
