import { clubWebsiteFromSocials, type Club } from "@repo/api";
import type { ClubsCreateFormValues } from "../components/ClubsCreateForm";

export function clubToFormValues(club: Club): ClubsCreateFormValues {
  const phone = club.contact.phones[0];
  return {
    ownerId: club.ownerId,
    name: club.identity.name,
    description: club.identity.description ?? "",
    phone: phone?.number ?? "",
    phoneLabel: phone?.label ?? "",
    website: clubWebsiteFromSocials(club.socials) ?? "",
    address: club.location?.address ?? "",
    direction: club.location?.direction ?? "center",
    categoryIds: club.categories
      .map((c) =>
        "id" in c && typeof (c as { id?: string }).id === "string"
          ? (c as { id: string }).id
          : ((c as { categoryId?: string }).categoryId ?? ""),
      )
      .filter(Boolean),
    sportIds: club.sports
      .map((s) =>
        "id" in s && typeof (s as { id?: string }).id === "string"
          ? (s as { id: string }).id
          : ((s as { sportId?: string }).sportId ?? ""),
      )
      .filter(Boolean),
    genderPolicy: club.audience?.genderPolicy ?? "mixed",
    accessibility: club.audience?.accessibility ?? "standard",
    ageGroupKeys: club.audience?.ageGroupKeys ?? [],
    levelKeys: club.audience?.levelKeys ?? [],
  };
}
