import { Types } from 'mongoose';
import type { LocationKind } from '../../common/enums';

export type LocationLike = {
  _id: Types.ObjectId;
  kind: LocationKind;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  flagSvg?: string;
  parentId?: Types.ObjectId;
  ancestors?: Types.ObjectId[];
  center?: { coordinates: [number, number] };
  coverMediaId?: Types.ObjectId;
  order: number;
  isActive: boolean;
};

export type LocationRefPublic = {
  id: string;
  kind: LocationKind;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  flagSvg: string | null;
  parentId: string | null;
  coordinates: { lng: number; lat: number } | null;
  coverMediaId: string | null;
  order: number;
  isActive: boolean;
};

export type LocationPublic = LocationRefPublic & {
  parent: LocationRefPublic | null;
  ancestors: LocationRefPublic[];
};

export function collectLocationRelatedIds(
  items: readonly LocationLike[],
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

export function toLocationRef(location: LocationLike): LocationRefPublic {
  return {
    id: location._id.toString(),
    kind: location.kind,
    name: location.name,
    slug: location.slug,
    description: location.description ?? null,
    icon: location.icon ?? null,
    flagSvg: location.flagSvg ?? null,
    parentId: location.parentId?.toString() ?? null,
    coordinates: location.center?.coordinates
      ? {
          lng: location.center.coordinates[0],
          lat: location.center.coordinates[1],
        }
      : null,
    coverMediaId: location.coverMediaId?.toString() ?? null,
    order: location.order,
    isActive: location.isActive,
  };
}

export function toLocationPublic(
  location: LocationLike,
  related: ReadonlyMap<string, LocationLike>,
): LocationPublic {
  const parent = location.parentId
    ? related.get(location.parentId.toString())
    : undefined;
  return {
    ...toLocationRef(location),
    parent: parent ? toLocationRef(parent) : null,
    ancestors: (location.ancestors ?? []).map((ancestor) => {
      const doc = related.get(ancestor.toString());
      return doc ? toLocationRef(doc) : { id: ancestor.toString() };
    }) as LocationRefPublic[],
  };
}
