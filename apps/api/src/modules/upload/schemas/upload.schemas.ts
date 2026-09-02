import { z } from "zod";
import { ASSET_VISIBILITIES, UPLOAD_PURPOSES } from "../enums/index.js";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i);
export const uploadQuerySchema = z
  .object({
    purpose: z.enum(UPLOAD_PURPOSES),
    organization_id: objectId.optional(),
    visibility: z.enum(ASSET_VISIBILITIES).default("private"),
  })
  .superRefine((value, context) => {
    if (value.purpose === "verification" && value.visibility === "public")
      context.addIssue({
        code: "custom",
        path: ["visibility"],
        message: "Verification documents cannot be public",
      });
    if (value.visibility === "organization" && !value.organization_id)
      context.addIssue({
        code: "custom",
        path: ["organization_id"],
        message: "Organization visibility requires organization_id",
      });
  });
