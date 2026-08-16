const STORAGE_KEY = "gym4me.discovery.latestSearches";
const MAX_ITEMS = 12;

export type DiscoverySearchHistoryItem = {
  query: string;
  savedAt: number;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeQuery(query: string) {
  return query.trim().replace(/\s+/g, " ");
}

function parseHistory(raw: string | null): DiscoverySearchHistoryItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (typeof item === "string") {
          const query = normalizeQuery(item);
          return query ? { query, savedAt: 0 } : null;
        }
        if (
          item &&
          typeof item === "object" &&
          "query" in item &&
          typeof (item as { query: unknown }).query === "string"
        ) {
          const query = normalizeQuery((item as { query: string }).query);
          if (!query) return null;
          const savedAt =
            "savedAt" in item &&
            typeof (item as { savedAt: unknown }).savedAt === "number"
              ? (item as { savedAt: number }).savedAt
              : 0;
          return { query, savedAt };
        }
        return null;
      })
      .filter((item): item is DiscoverySearchHistoryItem => item != null)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function readDiscoverySearchHistory(): DiscoverySearchHistoryItem[] {
  if (!canUseStorage()) return [];
  return parseHistory(window.localStorage.getItem(STORAGE_KEY));
}

export function pushDiscoverySearchHistory(
  query: string,
): DiscoverySearchHistoryItem[] {
  const normalized = normalizeQuery(query);
  if (!normalized || !canUseStorage()) {
    return readDiscoverySearchHistory();
  }

  const next: DiscoverySearchHistoryItem[] = [
    { query: normalized, savedAt: Date.now() },
    ...readDiscoverySearchHistory().filter(
      (item) => item.query.toLowerCase() !== normalized.toLowerCase(),
    ),
  ].slice(0, MAX_ITEMS);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearDiscoverySearchHistory() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
