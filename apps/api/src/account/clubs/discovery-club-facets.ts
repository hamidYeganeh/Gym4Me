import {
  ClubLifecycleStatus,
  ClubOperationalStatus,
} from '../../common/enums';

/** Same visibility as `GET /discovery/clubs` (approved, active, not a branch). */
export const DISCOVERY_VISIBLE_CLUB_MATCH = {
  'review.status': ClubLifecycleStatus.APPROVED,
  operationalStatus: ClubOperationalStatus.ACTIVE,
  parentClubId: { $exists: false },
} as const;

export type DiscoveryCategoryFacetRow = {
  _id?: { toString(): string } | null;
  count: number;
};

export function mapDiscoveryCategoryFacetRows(
  rows: readonly DiscoveryCategoryFacetRow[],
): { id: string; count: number }[] {
  return rows.flatMap((row) => {
    if (row._id == null || row.count < 1) return [];
    return [{ id: row._id.toString(), count: row.count }];
  });
}
