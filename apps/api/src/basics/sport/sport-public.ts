import { Types } from 'mongoose';
import type { SportKind } from '../../common/enums';

export type SportLike = {
  _id: Types.ObjectId;
  kind: SportKind;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  coverMediaId?: Types.ObjectId;
  parentId?: Types.ObjectId;
  ancestors?: Types.ObjectId[];
  order: number;
  isActive: boolean;
};

export type SportRefPublic = {
  id: string;
  kind: SportKind;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  coverMediaId: string | null;
  parentId: string | null;
  order: number;
  isActive: boolean;
};

export type SportPublic = SportRefPublic & {
  parent: SportRefPublic | null;
  ancestors: SportRefPublic[];
};

export function collectSportRelatedIds(
  items: readonly SportLike[],
): Types.ObjectId[] {
  const ids = new Set<string>();
  for (const item of items) {
    if (item.parentId) ids.add(item.parentId.toString());
    for (const ancestor of item.ancestors ?? []) {
      ids.add(ancestor.toString());
    }
  }
  return [...ids].map((id) => new Types.ObjectId(id));
}

export function toSportRef(sport: SportLike): SportRefPublic {
  return {
    id: sport._id.toString(),
    kind: sport.kind,
    name: sport.name,
    slug: sport.slug,
    description: sport.description ?? null,
    icon: sport.icon ?? null,
    coverMediaId: sport.coverMediaId?.toString() ?? null,
    parentId: sport.parentId?.toString() ?? null,
    order: sport.order,
    isActive: sport.isActive,
  };
}

export function toSportPublic(
  sport: SportLike,
  related: ReadonlyMap<string, SportLike>,
): SportPublic {
  const parent = sport.parentId
    ? related.get(sport.parentId.toString())
    : undefined;
  return {
    ...toSportRef(sport),
    parent: parent ? toSportRef(parent) : null,
    ancestors: (sport.ancestors ?? []).map((ancestor) => {
      const doc = related.get(ancestor.toString());
      return doc ? toSportRef(doc) : { id: ancestor.toString() };
    }) as SportRefPublic[],
  };
}
