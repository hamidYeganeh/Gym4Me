import { getNativeSecureStore } from "@/shared/lib/native-secure-store";
import type { AthleteWorkoutPlanDetail } from "@/modules/athlete/lib/workout-programs-data";

const STORAGE_KEY = "gym4me.workout-plan-cache.v1";
type Cache = Record<string, { savedAt: string; detail: AthleteWorkoutPlanDetail }>;

async function read(): Promise<Cache> {
  if (typeof window === "undefined") return {};
  try {
    const secure = await getNativeSecureStore();
    const raw = secure.isNative
      ? await secure.getItem(STORAGE_KEY)
      : window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    return {};
  }
}

async function write(cache: Cache) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(cache);
  const secure = await getNativeSecureStore();
  if (secure.isNative) {
    await secure.setItem(STORAGE_KEY, raw);
  } else {
    window.localStorage.setItem(STORAGE_KEY, raw);
  }
}

export async function loadWorkoutPlanCache(planId: string) {
  return (await read())[planId]?.detail ?? null;
}

export async function saveWorkoutPlanCache(
  planId: string,
  detail: AthleteWorkoutPlanDetail,
) {
  const cache = await read();
  cache[planId] = { savedAt: new Date().toISOString(), detail };
  await write(cache);
}

export async function clearWorkoutPlanCache() {
  if (typeof window === "undefined") return;
  const secure = await getNativeSecureStore();
  if (secure.isNative) {
    await secure.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
