import { Preferences } from "@capacitor/preferences";
import { BASICS_CHOICES_STALE_TIME_MS } from "@repo/api/basics";
import type { PublicChoiceGroup } from "@repo/api";
import { ApiError } from "@repo/api";
import { basicsChoices } from "@/shared/lib/api";

const CACHE_KEY = "gym4me.basics.choices.v1";

type CachedChoices = {
  expiresAt: number;
  groups: PublicChoiceGroup[];
};

let memory: CachedChoices | null = null;
let inflight: Promise<PublicChoiceGroup[]> | null = null;

function isValidCache(value: unknown): value is CachedChoices {
  if (!value || typeof value !== "object") return false;
  const cached = value as CachedChoices;
  return (
    typeof cached.expiresAt === "number" &&
    Array.isArray(cached.groups) &&
    cached.groups.every(
      (group) =>
        group &&
        typeof group === "object" &&
        typeof group.value === "string" &&
        Array.isArray(group.options),
    )
  );
}

async function readPersisted(): Promise<CachedChoices | null> {
  try {
    const { value } = await Preferences.get({ key: CACHE_KEY });
    if (!value) return null;
    const parsed = JSON.parse(value) as unknown;
    return isValidCache(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function writePersisted(cached: CachedChoices) {
  try {
    await Preferences.set({
      key: CACHE_KEY,
      value: JSON.stringify(cached),
    });
  } catch {
    // In-memory cache still works if Preferences is unavailable.
  }
}

/**
 * Loads every active choice group via `GET /basics/choices` and caches for 4h
 * (memory + Preferences). Concurrent callers share one in-flight request.
 */
export async function loadChoiceGroups(
  options?: { force?: boolean },
): Promise<PublicChoiceGroup[]> {
  const force = options?.force === true;
  const now = Date.now();

  if (!force && memory && memory.expiresAt > now) {
    return memory.groups;
  }

  if (!force) {
    const persisted = await readPersisted();
    if (persisted && persisted.expiresAt > now) {
      memory = persisted;
      return persisted.groups;
    }
  }

  if (!inflight) {
    inflight = basicsChoices
      .listAll()
      .then(async (groups) => {
        const cached: CachedChoices = {
          expiresAt: Date.now() + BASICS_CHOICES_STALE_TIME_MS,
          groups,
        };
        memory = cached;
        await writePersisted(cached);
        return groups;
      })
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}

export async function getChoiceGroup(key: string): Promise<PublicChoiceGroup> {
  const groups = await loadChoiceGroups();
  const group = groups.find((item) => item.value === key);
  if (!group) {
    throw new ApiError(404, null, `Choice group not found: ${key}`);
  }
  return group;
}

export async function listUnitChoiceGroups(): Promise<PublicChoiceGroup[]> {
  const groups = await loadChoiceGroups();
  return groups
    .filter((group) => group.value.endsWith("_unit"))
    .slice()
    .sort((a, b) => a.value.localeCompare(b.value));
}

export function clearChoiceGroupsCache() {
  memory = null;
  void Preferences.remove({ key: CACHE_KEY });
}
