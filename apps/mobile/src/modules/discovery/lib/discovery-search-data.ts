import { FEATURED_COACHES } from "./coaches-browse-data";

export type DiscoverySearchTopic = {
  id: string;
  label: string;
};

export type DiscoverySearchUser = {
  id: string;
  name: string;
  image: string;
  joinedYear: number;
  topicIds: string[];
};

/** Hashtag topics for `/discovery/search` (replaceable by API adapters). */
export const DISCOVERY_SEARCH_TOPICS: DiscoverySearchTopic[] = [
  { id: "wellness", label: "تندرستی" },
  { id: "nutrition", label: "تغذیه" },
  { id: "health", label: "سلامت" },
  { id: "activity", label: "فعالیت" },
  { id: "smarthealth", label: "سلامت‌هوشمند" },
  { id: "smartworkout", label: "تمرین‌هوشمند" },
  { id: "intelligenthealth", label: "سلامتی‌هوشمند" },
  { id: "healthtrend", label: "ترندسلامت" },
];

const USER_TOPICS: Record<string, string[]> = {
  zuckmann: ["wellness", "health", "activity"],
  "arnold-feat": ["smartworkout", "activity", "healthtrend"],
  "jeanette-feat": ["nutrition", "wellness", "smarthealth"],
  "analene-feat": ["intelligenthealth", "wellness", "health"],
};

const USER_JOINED_YEAR: Record<string, number> = {
  zuckmann: 1401,
  "arnold-feat": 1402,
  "jeanette-feat": 1403,
  "analene-feat": 1402,
};

/** People to follow on the search/explore landing. */
export const DISCOVERY_SEARCH_USERS: DiscoverySearchUser[] = FEATURED_COACHES.map(
  (coach) => ({
    id: coach.id,
    name: coach.name,
    image: coach.image,
    joinedYear: USER_JOINED_YEAR[coach.id] ?? 1402,
    topicIds: USER_TOPICS[coach.id] ?? ["wellness"],
  }),
);

export function normalizeDiscoverySearchQuery(query: string) {
  return query.trim().replace(/^#\s*/, "").replace(/\s+/g, " ");
}

export function filterDiscoverySearchTopics(
  topics: DiscoverySearchTopic[],
  query: string,
  selectedTopicId: string | null,
) {
  const normalized = normalizeDiscoverySearchQuery(query);
  if (!normalized || selectedTopicId) return topics;
  const needle = normalized.toLocaleLowerCase("fa");
  return topics.filter((topic) =>
    topic.label.toLocaleLowerCase("fa").includes(needle),
  );
}

export function filterDiscoverySearchUsers(
  users: DiscoverySearchUser[],
  query: string,
  selectedTopicId: string | null,
) {
  if (selectedTopicId) {
    return users.filter((user) => user.topicIds.includes(selectedTopicId));
  }
  const normalized = normalizeDiscoverySearchQuery(query);
  if (!normalized) return users;
  const needle = normalized.toLocaleLowerCase("fa");
  return users.filter((user) =>
    user.name.toLocaleLowerCase("fa").includes(needle),
  );
}

export function topicIdForQuery(
  topics: DiscoverySearchTopic[],
  query: string,
) {
  const normalized = normalizeDiscoverySearchQuery(query);
  if (!normalized) return null;
  const exact = topics.find((topic) => topic.label === normalized);
  return exact?.id ?? null;
}
