import { z } from "zod";
import type { GeoDirection } from "@repo/api";
import { clubsCreateFormMockDefaults } from "../../lib/clubs-data";

export type ClubsCreateFormMessages = {
  required: string;
};

const directionSchema = z.custom<GeoDirection>(
  (value) =>
    typeof value === "string" &&
    ["north", "south", "east", "west", "center"].includes(value),
);

export function createClubsCreateFormSchema(messages: ClubsCreateFormMessages) {
  return z.object({
    ownerId: z.string().trim().min(1, messages.required),
    name: z.string().trim().min(1, messages.required),
    description: z.string().trim(),
    phone: z.string().trim().min(1, messages.required),
    phoneLabel: z.string().trim(),
    website: z.string().trim(),
    address: z.string().trim().min(1, messages.required),
    direction: directionSchema,
    categoryIds: z.array(z.string()),
    sportIds: z.array(z.string()),
    genderPolicy: z.string(),
    accessibility: z.string(),
    ageGroupKeys: z.array(z.string()),
    levelKeys: z.array(z.string()),
  });
}

export type ClubsCreateFormValues = z.infer<
  ReturnType<typeof createClubsCreateFormSchema>
>;

export const clubsCreateFormDefaults: ClubsCreateFormValues = {
  ownerId: "",
  name: "",
  description: "",
  phone: "",
  phoneLabel: "",
  website: "",
  address: "",
  direction: "center",
  categoryIds: [],
  sportIds: [],
  genderPolicy: "mixed",
  accessibility: "standard",
  ageGroupKeys: ["adults"],
  levelKeys: ["standard"],
};

export const clubsCreateFormPrefill: ClubsCreateFormValues = {
  ...clubsCreateFormMockDefaults,
  genderPolicy: "mixed",
  accessibility: "standard",
  ageGroupKeys: ["adults"],
  levelKeys: ["standard"],
};
