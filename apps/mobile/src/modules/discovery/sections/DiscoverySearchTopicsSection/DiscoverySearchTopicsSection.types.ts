import type { DiscoverySearchTopic } from "../../lib/discovery-search-data";

export type DiscoverySearchTopicsSectionProps = {
  topics: DiscoverySearchTopic[];
  selectedTopicId: string | null;
  title: string;
  emptyLabel: string;
  topicAria: (topic: string) => string;
  onSelect: (topic: DiscoverySearchTopic) => void;
  className?: string;
};
