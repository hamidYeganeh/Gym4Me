export const accountClubSlotsKeys = {
  all: ["account", "club-slots"] as const,
  classes: (clubId: string) =>
    [...accountClubSlotsKeys.all, "classes", clubId] as const,
  class: (clubId: string, classId: string) =>
    [...accountClubSlotsKeys.classes(clubId), classId] as const,
  slots: (clubId: string) =>
    [...accountClubSlotsKeys.all, "slots", clubId] as const,
  slot: (clubId: string, slotId: string) =>
    [...accountClubSlotsKeys.slots(clubId), slotId] as const,
};
