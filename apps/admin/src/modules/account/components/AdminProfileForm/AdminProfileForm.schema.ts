import { z } from "zod";

export const adminProfileFormSchema = z.object({
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  avatarMediaId: z.string().trim(),
});

export type AdminProfileFormValues = z.infer<typeof adminProfileFormSchema>;
