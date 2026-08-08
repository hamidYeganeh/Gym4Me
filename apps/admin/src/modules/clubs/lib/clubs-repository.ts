import type {
  AdminCreateClubInput,
  Club,
  ClubClass,
  ClubSlot,
  CreateClubClassInput,
  CreateClubSlotInput,
  Paginated,
  UpdateClubClassInput,
  UpdateClubInput,
  UpdateClubSlotInput,
} from "@repo/api";
import { adminClubs, adminClubSlots } from "@/shared/lib/api";
import {
  CLUBS_USE_MOCK,
  MOCK_CLUBS,
  MOCK_CLUB_USER_REVIEWS,
  buildClubFromCreateInput,
  filterMockClubs,
  type ClubListQuery,
} from "./clubs-data";

let mockStore: Club[] = MOCK_CLUBS.map((c) => structuredClone(c));
let mockClasses = new Map<string, ClubClass[]>();
let mockSlots = new Map<string, ClubSlot[]>();

function cloneClub(club: Club): Club {
  return structuredClone(club);
}

function emptyPage<T>(result: T[]) {
  return {
    result,
    pagination: {
      page: 1,
      page_size: Math.max(result.length, 1),
      next: null,
      prev: null,
      total: result.length,
    },
  };
}

function newId(prefix: string) {
  return `${prefix}${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`;
}

export function isClubsMockMode(): boolean {
  return CLUBS_USE_MOCK;
}

export async function listClubs(
  query: ClubListQuery = {},
): Promise<Paginated<Club>> {
  if (!CLUBS_USE_MOCK) {
    return adminClubs.list(query);
  }
  return filterMockClubs(mockStore, query);
}

export async function getClub(clubId: string): Promise<Club> {
  if (!CLUBS_USE_MOCK) {
    return adminClubs.get(clubId);
  }
  const club = mockStore.find((c) => c.id === clubId);
  if (!club) throw new Error("Club not found");
  return cloneClub(club);
}

export async function createClub(input: AdminCreateClubInput): Promise<Club> {
  if (!CLUBS_USE_MOCK) {
    return adminClubs.create(input);
  }
  const club = buildClubFromCreateInput(input);
  mockStore = [club, ...mockStore];
  return cloneClub(club);
}

export async function updateClub(
  clubId: string,
  input: UpdateClubInput,
): Promise<Club> {
  if (!CLUBS_USE_MOCK) {
    return adminClubs.update(clubId, input);
  }
  const index = mockStore.findIndex((c) => c.id === clubId);
  if (index < 0) throw new Error("Club not found");
  const current = mockStore[index]!;
  const next: Club = {
    ...current,
    identity: {
      name: input.identity?.name?.trim() ?? current.identity.name,
      description:
        input.identity?.description !== undefined
          ? (input.identity.description ?? null)
          : current.identity.description,
      coverMediaId:
        input.identity?.coverMediaId !== undefined
          ? (input.identity.coverMediaId ?? null)
          : current.identity.coverMediaId,
    },
    contact: input.contact
      ? {
          phones: (input.contact.phones ?? current.contact.phones).map((p) => ({
            number: p.number,
            label: p.label ?? null,
          })),
          website:
            input.contact.website !== undefined
              ? (input.contact.website ?? null)
              : current.contact.website,
        }
      : current.contact,
    location:
      input.location === null
        ? null
        : input.location
          ? {
              address: input.location.address,
              point: input.location.point ?? null,
              direction: input.location.direction ?? null,
              locationId: input.location.locationId ?? null,
              ancestors: current.location?.ancestors ?? [],
            }
          : current.location,
    categories:
      input.categoryIds !== undefined
        ? input.categoryIds.map((id) => ({ id }))
        : current.categories,
    sports:
      input.sportIds !== undefined
        ? input.sportIds.map((id) => ({ id }))
        : current.sports,
    updatedAt: new Date().toISOString(),
  };
  mockStore[index] = next;
  return cloneClub(next);
}

export async function removeClub(clubId: string): Promise<{ success: true }> {
  if (!CLUBS_USE_MOCK) {
    return adminClubs.remove(clubId);
  }
  mockStore = mockStore.filter((c) => c.id !== clubId);
  return { success: true };
}

export async function activateClub(clubId: string): Promise<Club> {
  if (!CLUBS_USE_MOCK) {
    return adminClubs.activate(clubId);
  }
  return patchOperational(clubId, "active");
}

export async function deactivateClub(clubId: string): Promise<Club> {
  if (!CLUBS_USE_MOCK) {
    return adminClubs.deactivate(clubId);
  }
  return patchOperational(clubId, "inactive");
}

async function patchOperational(
  clubId: string,
  operationalStatus: Club["operationalStatus"],
): Promise<Club> {
  const index = mockStore.findIndex((c) => c.id === clubId);
  if (index < 0) throw new Error("Club not found");
  mockStore[index] = {
    ...mockStore[index]!,
    operationalStatus,
    updatedAt: new Date().toISOString(),
  };
  return cloneClub(mockStore[index]!);
}

export async function listClubBranches(clubId: string) {
  if (!CLUBS_USE_MOCK) {
    return adminClubs.listBranches(clubId);
  }
  return {
    result: mockStore.filter((c) => c.parentClubId === clubId).map(cloneClub),
    pagination: {
      page: 1,
      page_size: 20,
      next: null,
      prev: null,
      total: mockStore.filter((c) => c.parentClubId === clubId).length,
    },
  };
}

export async function listClubCoaches(clubId: string) {
  if (!CLUBS_USE_MOCK) {
    return adminClubs.listCoaches(clubId);
  }
  const club = await getClub(clubId);
  return {
    result: club.coaches,
    pagination: {
      page: 1,
      page_size: Math.max(club.coaches.length, 1),
      next: null,
      prev: null,
      total: club.coaches.length,
    },
  };
}

export async function assignClubCoach(clubId: string, coachId: string) {
  if (!CLUBS_USE_MOCK) {
    return adminClubs.assignCoach(clubId, coachId);
  }
  const club = await getClub(clubId);
  if (!club.coaches.some((c) => c.coachId === coachId)) {
    club.coaches = [...club.coaches, { coachId }];
    const index = mockStore.findIndex((c) => c.id === clubId);
    if (index >= 0) mockStore[index] = club;
  }
  return listClubCoaches(clubId);
}

export async function unassignClubCoach(clubId: string, coachId: string) {
  if (!CLUBS_USE_MOCK) {
    return adminClubs.unassignCoach(clubId, coachId);
  }
  const club = await getClub(clubId);
  club.coaches = club.coaches.filter((c) => c.coachId !== coachId);
  const index = mockStore.findIndex((c) => c.id === clubId);
  if (index >= 0) mockStore[index] = club;
  return listClubCoaches(clubId);
}

export async function listClubClasses(clubId: string) {
  if (!CLUBS_USE_MOCK) {
    return adminClubSlots.listClasses(clubId);
  }
  return emptyPage(structuredClone(mockClasses.get(clubId) ?? []));
}

export async function createClubClass(
  clubId: string,
  input: CreateClubClassInput,
): Promise<ClubClass> {
  if (!CLUBS_USE_MOCK) {
    return adminClubSlots.createClass(clubId, input);
  }
  const doc: ClubClass = {
    id: newId("665fclass"),
    clubId,
    title: input.title,
    description: input.description ?? null,
    sportId: input.sportId ?? null,
    coachId: input.coachId ?? null,
    media: { coverMediaId: input.media?.coverMediaId ?? null },
    status: input.status ?? "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const list = mockClasses.get(clubId) ?? [];
  mockClasses.set(clubId, [doc, ...list]);
  return structuredClone(doc);
}

export async function updateClubClass(
  clubId: string,
  classId: string,
  input: UpdateClubClassInput,
): Promise<ClubClass> {
  if (!CLUBS_USE_MOCK) {
    return adminClubSlots.updateClass(clubId, classId, input);
  }
  const list = mockClasses.get(clubId) ?? [];
  const index = list.findIndex((c) => c.id === classId);
  if (index < 0) throw new Error("Class not found");
  const current = list[index]!;
  const next: ClubClass = {
    ...current,
    title: input.title ?? current.title,
    description:
      input.description !== undefined
        ? (input.description ?? null)
        : current.description,
    sportId:
      input.sportId !== undefined ? (input.sportId ?? null) : current.sportId,
    coachId:
      input.coachId !== undefined ? (input.coachId ?? null) : current.coachId,
    media: input.media
      ? { coverMediaId: input.media.coverMediaId ?? null }
      : current.media,
    status: input.status ?? current.status,
    updatedAt: new Date().toISOString(),
  };
  list[index] = next;
  mockClasses.set(clubId, list);
  return structuredClone(next);
}

export async function archiveClubClass(clubId: string, classId: string) {
  if (!CLUBS_USE_MOCK) {
    return adminClubSlots.archiveClass(clubId, classId);
  }
  return updateClubClass(clubId, classId, { status: "archived" });
}

export async function listClubSlots(clubId: string) {
  if (!CLUBS_USE_MOCK) {
    return adminClubSlots.listSlots(clubId);
  }
  return emptyPage(structuredClone(mockSlots.get(clubId) ?? []));
}

export async function createClubSlot(
  clubId: string,
  input: CreateClubSlotInput,
): Promise<ClubSlot> {
  if (!CLUBS_USE_MOCK) {
    return adminClubSlots.createSlot(clubId, input);
  }
  const doc: ClubSlot = {
    id: newId("665fslot"),
    clubId,
    kind: input.kind,
    classId: input.classId ?? null,
    coachId: input.coachId ?? null,
    capacity: input.capacity,
    schedule: {
      recurrence: {
        type: input.schedule.recurrence.type,
        weekday: input.schedule.recurrence.weekday ?? null,
        date: input.schedule.recurrence.date ?? null,
        startTime: input.schedule.recurrence.startTime,
        endTime: input.schedule.recurrence.endTime,
        startsOn: input.schedule.recurrence.startsOn ?? null,
        endsOn: input.schedule.recurrence.endsOn ?? null,
      },
      exceptions: input.schedule.exceptions ?? [],
    },
    status: input.status ?? "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const list = mockSlots.get(clubId) ?? [];
  mockSlots.set(clubId, [doc, ...list]);
  return structuredClone(doc);
}

export async function updateClubSlot(
  clubId: string,
  slotId: string,
  input: UpdateClubSlotInput,
): Promise<ClubSlot> {
  if (!CLUBS_USE_MOCK) {
    return adminClubSlots.updateSlot(clubId, slotId, input);
  }
  const list = mockSlots.get(clubId) ?? [];
  const index = list.findIndex((s) => s.id === slotId);
  if (index < 0) throw new Error("Slot not found");
  const current = list[index]!;
  const next: ClubSlot = {
    ...current,
    kind: input.kind ?? current.kind,
    classId:
      input.classId !== undefined ? (input.classId ?? null) : current.classId,
    coachId:
      input.coachId !== undefined ? (input.coachId ?? null) : current.coachId,
    capacity: input.capacity ?? current.capacity,
    schedule: input.schedule
      ? {
          recurrence: {
            type: input.schedule.recurrence.type,
            weekday: input.schedule.recurrence.weekday ?? null,
            date: input.schedule.recurrence.date ?? null,
            startTime: input.schedule.recurrence.startTime,
            endTime: input.schedule.recurrence.endTime,
            startsOn: input.schedule.recurrence.startsOn ?? null,
            endsOn: input.schedule.recurrence.endsOn ?? null,
          },
          exceptions: input.schedule.exceptions ?? [],
        }
      : current.schedule,
    status: input.status ?? current.status,
    updatedAt: new Date().toISOString(),
  };
  list[index] = next;
  mockSlots.set(clubId, list);
  return structuredClone(next);
}

export async function archiveClubSlot(clubId: string, slotId: string) {
  if (!CLUBS_USE_MOCK) {
    return adminClubSlots.archiveSlot(clubId, slotId);
  }
  return updateClubSlot(clubId, slotId, { status: "archived" });
}

export async function cancelClubSlotOccurrence(
  clubId: string,
  slotId: string,
  date: string,
) {
  if (!CLUBS_USE_MOCK) {
    return adminClubSlots.cancelOccurrence(clubId, slotId, { date });
  }
  const list = mockSlots.get(clubId) ?? [];
  const index = list.findIndex((s) => s.id === slotId);
  if (index < 0) throw new Error("Slot not found");
  const current = list[index]!;
  const exceptions = [...current.schedule.exceptions];
  if (!exceptions.some((e) => e.date === date)) {
    exceptions.push({ date, status: "cancelled" });
  }
  const next: ClubSlot = {
    ...current,
    schedule: { ...current.schedule, exceptions },
    updatedAt: new Date().toISOString(),
  };
  list[index] = next;
  mockSlots.set(clubId, list);
  return structuredClone(next);
}

export async function listClubUserReviews(clubId: string) {
  if (!CLUBS_USE_MOCK) {
    return adminClubs.listReviews(clubId);
  }
  const items = MOCK_CLUB_USER_REVIEWS[clubId] ?? [];
  return emptyPage(items);
}

/** Reset in-memory store (tests / demos). */
export function resetMockClubs() {
  mockStore = MOCK_CLUBS.map((c) => structuredClone(c));
  mockClasses = new Map();
  mockSlots = new Map();
}
