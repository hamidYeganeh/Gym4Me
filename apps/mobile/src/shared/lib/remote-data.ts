export type RemoteDataResult<T> =
  | { status: "fresh" | "empty" | "stale"; data: T }
  | { status: "error"; error: unknown };

type RemoteDataOptions<T> = {
  load: () => Promise<T>;
  isEmpty: (data: T) => boolean;
  readCache?: () => T | null;
  writeCache?: (data: T) => void;
};

/**
 * Keeps successful API data distinct from an outage. A caller may explicitly
 * provide a cache; cached data is returned only as `stale`, never as fresh.
 */
export async function loadRemoteData<T>({
  load,
  isEmpty,
  readCache,
  writeCache,
}: RemoteDataOptions<T>): Promise<RemoteDataResult<T>> {
  try {
    const data = await load();
    writeCache?.(data);
    return { status: isEmpty(data) ? "empty" : "fresh", data };
  } catch (error) {
    const cached = readCache?.() ?? null;
    return cached === null
      ? { status: "error", error }
      : { status: "stale", data: cached };
  }
}
