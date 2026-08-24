import type {
  DiscoveryFeedResponse,
  DiscoverySectionDefinition,
} from "../discovery/feed.dto";
import type { Role } from "../types";

export type AdminDiscoveryPage = {
  id: string | null;
  pageKey: string;
  schemaVersion: number;
  draftSections: DiscoverySectionDefinition[];
  publishedSections: DiscoverySectionDefinition[];
  publishedRevision: number;
  publishedAt: string | null;
  updatedAt: string | null;
};

export type UpdateDiscoveryDraftInput = {
  sections: DiscoverySectionDefinition[];
};

export type PreviewDiscoveryDraftInput = {
  page?: number;
  page_size?: number;
  context?: {
    authenticated?: boolean;
    activeRole?: Role;
    sportIds?: string[];
    goalKeys?: string[];
    levelKey?: string;
    lat?: number;
    lng?: number;
    locationId?: string;
  };
};

export type PreviewDiscoveryDraftResponse = DiscoveryFeedResponse;
