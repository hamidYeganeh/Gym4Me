export const adminClubSlotsKeys = {
  all: ["admin", "club-slots"] as const,
  classes: (clubId: string) =>
    [...adminClubSlotsKeys.all, "classes", clubId] as const,
  class: (clubId: string, classId: string) =>
    [...adminClubSlotsKeys.classes(clubId), classId] as const,
  spaces: (clubId: string) =>
    [...adminClubSlotsKeys.all, "spaces", clubId] as const,
  space: (clubId: string, spaceId: string) =>
    [...adminClubSlotsKeys.spaces(clubId), spaceId] as const,
  slots: (clubId: string) =>
    [...adminClubSlotsKeys.all, "slots", clubId] as const,
  slot: (clubId: string, slotId: string) =>
    [...adminClubSlotsKeys.slots(clubId), slotId] as const,
};
