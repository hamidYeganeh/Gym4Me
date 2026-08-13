import { BadRequestException } from '@nestjs/common';
import {
  createSearchFilter,
  resolveListSort,
  toStringArray,
} from './list-query.util';

describe('resolveListSort', () => {
  const fields = {
    createdAt: 'createdAt',
    name: 'identity.name',
  } as const;

  it('preserves the resource default when no sort is requested', () => {
    expect(resolveListSort({}, fields, { createdAt: -1 })).toEqual({
      createdAt: -1,
    });
  });

  it('maps a public sort key and adds a stable tie-breaker', () => {
    expect(
      resolveListSort(
        { sortBy: 'name', sortOrder: 'desc' },
        fields,
        { createdAt: -1 },
      ),
    ).toEqual({ 'identity.name': -1, _id: -1 });
  });

  it('defaults an explicitly selected sort field to ascending', () => {
    expect(
      resolveListSort({ sortBy: 'createdAt' }, fields, { createdAt: -1 }),
    ).toEqual({ createdAt: 1, _id: 1 });
  });

  it('rejects database paths that are not public sort keys', () => {
    expect(() =>
      resolveListSort(
        { sortBy: '$where' },
        fields,
        { createdAt: -1 },
      ),
    ).toThrow(BadRequestException);
  });
});

describe('createSearchFilter', () => {
  it('escapes regex syntax and searches only declared fields', () => {
    const filter = createSearchFilter('mahdi.*', ['name', 'phone']) as {
      $or: Array<Record<string, RegExp>>;
    };

    expect(filter.$or).toHaveLength(2);
    expect(filter.$or[0]?.name.source).toBe('mahdi\\.\\*');
    expect(filter.$or[1]?.phone.flags).toContain('i');
  });

  it('returns no filter for blank input', () => {
    expect(createSearchFilter('  ', ['name'])).toEqual({});
  });
});

describe('toStringArray', () => {
  it('supports comma-separated and repeated query values', () => {
    expect(
      toStringArray({
        value: ['pending,approved', 'pending'],
        key: 'status',
        obj: {},
        type: 0,
        options: {},
      }),
    ).toEqual(['pending', 'approved']);
  });
});
