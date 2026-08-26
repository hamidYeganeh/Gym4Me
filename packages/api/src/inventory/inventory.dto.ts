import type { Paginated } from "../types";

export type ClubInventoryCondition =
  | "good"
  | "needs_repair"
  | "out_of_service";
export type ClubInventoryStatus = "active" | "archived";

export type ClubInventoryItem = {
  id: string;
  clubId: string;
  name: string;
  quantity: number;
  locationLabel: string | null;
  condition: ClubInventoryCondition;
  nextServiceAt: string | null;
  maintenanceNote: string | null;
  status: ClubInventoryStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type InventoryPage = Paginated<ClubInventoryItem>;

export type ListInventoryQuery = {
  page?: number;
  page_size?: number;
  condition?: ClubInventoryCondition;
  status?: ClubInventoryStatus;
};

export type CreateInventoryItemInput = {
  name: string;
  quantity: number;
  locationLabel?: string;
  condition?: ClubInventoryCondition;
  nextServiceAt?: string;
  maintenanceNote?: string;
  idempotencyKey: string;
};

export type UpdateInventoryItemInput = {
  expectedVersion: number;
  name?: string;
  quantity?: number;
  locationLabel?: string;
  condition?: ClubInventoryCondition;
  nextServiceAt?: string | null;
  maintenanceNote?: string;
};
