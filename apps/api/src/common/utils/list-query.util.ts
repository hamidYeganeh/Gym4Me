import { BadRequestException } from '@nestjs/common';
import type { TransformFnParams } from 'class-transformer';
import { escapeRegex } from './escape-regex.util';

export type ListSortOrder = 'asc' | 'desc';
export type MongoSort = Record<string, 1 | -1>;
export type SortFieldMap = Readonly<Record<string, string>>;

export type ListQuery = {
  search?: string;
  sortBy?: string;
  sortOrder?: ListSortOrder;
};

export function resolveListSort(
  query: Pick<ListQuery, 'sortBy' | 'sortOrder'>,
  fields: SortFieldMap,
  defaultSort: MongoSort,
): MongoSort {
  if (!query.sortBy) return defaultSort;

  const field = fields[query.sortBy];
  if (!field) {
    throw new BadRequestException({
      statusCode: 400,
      error: 'Bad Request',
      message: {
        sortBy: [
          `sortBy must be one of: ${Object.keys(fields).sort().join(', ')}`,
        ],
      },
    });
  }

  const direction = query.sortOrder === 'desc' ? -1 : 1;
  return field === '_id' ? { _id: direction } : { [field]: direction, _id: direction };
}

export function createSearchFilter(
  search: string | undefined,
  fields: readonly string[],
): Record<string, unknown> {
  const value = search?.trim();
  if (!value || fields.length === 0) return {};

  const regex = new RegExp(escapeRegex(value), 'i');
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
}

export function toStringArray({ value }: TransformFnParams): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;

  const values = (Array.isArray(value) ? value : [value])
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean);

  return values.length > 0 ? [...new Set(values)] : undefined;
}
