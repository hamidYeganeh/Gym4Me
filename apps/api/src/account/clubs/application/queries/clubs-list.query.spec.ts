import { Types } from 'mongoose';
import {
  ClubLifecycleStatus,
  ClubOperationalStatus,
  RefType,
} from '../../../../common/enums';
import { ClubsListQuery } from './clubs-list.query';

function boundedQuery<T>(items: T[]) {
  const limit = jest.fn().mockResolvedValue(items);
  const skip = jest.fn().mockReturnValue({ limit });
  const sort = jest.fn().mockReturnValue({ skip });
  return { root: { sort }, spies: { limit, skip, sort } };
}

function selectableLean<T>(value: T) {
  return {
    select: jest
      .fn()
      .mockReturnValue({ lean: jest.fn().mockResolvedValue(value) }),
  };
}

describe('ClubsListQuery', () => {
  function setup() {
    const mongoQuery = boundedQuery([{ _id: new Types.ObjectId() }]);
    const clubModel = {
      find: jest.fn().mockReturnValue(mongoQuery.root),
      countDocuments: jest.fn().mockResolvedValue(41),
    };
    const refModel = {
      findOne: jest
        .fn()
        .mockReturnValue(selectableLean({ _id: new Types.ObjectId() })),
    };
    return {
      clubModel,
      mongoQuery,
      query: new ClubsListQuery(clubModel as never, refModel as never),
      refModel,
    };
  }

  it('builds a bounded discovery query with escaped search and references', async () => {
    const categoryId = new Types.ObjectId().toString();
    const sportId = new Types.ObjectId().toString();
    const locationId = new Types.ObjectId().toString();
    const { clubModel, mongoQuery, query } = setup();

    const result = await query.discovery({
      page: 2,
      page_size: 20,
      q: 'باشگاه (VIP)',
      categoryId,
      sportId,
      locationId,
      direction: 'north',
    });

    expect(clubModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        'review.status': ClubLifecycleStatus.APPROVED,
        operationalStatus: ClubOperationalStatus.ACTIVE,
        'identity.name': { $regex: 'باشگاه \\(VIP\\)', $options: 'i' },
        'categories.categoryId': new Types.ObjectId(categoryId),
        'sports.sportId': new Types.ObjectId(sportId),
        'location.direction': 'north',
        $or: [
          { 'location.locationId': new Types.ObjectId(locationId) },
          { 'location.ancestors': new Types.ObjectId(locationId) },
        ],
      }),
    );
    expect(mongoQuery.spies.sort).toHaveBeenCalledWith({
      'reviewsSummary.average': -1,
      createdAt: -1,
    });
    expect(mongoQuery.spies.skip).toHaveBeenCalledWith(20);
    expect(mongoQuery.spies.limit).toHaveBeenCalledWith(20);
    expect(result).toMatchObject({ total: 41, page: 2, pageSize: 20 });
  });

  it('returns an empty bounded page when an amenity slug does not exist', async () => {
    const { clubModel, query, refModel } = setup();
    refModel.findOne.mockReturnValue(selectableLean(null));

    await expect(query.discovery({ amenitySlug: 'POOL' })).resolves.toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    expect(refModel.findOne).toHaveBeenCalledWith({
      type: RefType.AMENITY,
      slug: 'pool',
      isActive: true,
    });
    expect(clubModel.find).not.toHaveBeenCalled();
  });

  it('uses the geo index order and caps the requested radius page', async () => {
    const { clubModel, mongoQuery, query } = setup();

    await query.discovery({
      lng: 51.389,
      lat: 35.6892,
      radiusMeters: 5_000,
      page_size: 500,
    });

    expect(clubModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        'location.point': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [51.389, 35.6892],
            },
            $maxDistance: 5_000,
          },
        },
      }),
    );
    expect(mongoQuery.spies.sort).toHaveBeenCalledWith(undefined);
    expect(mongoQuery.spies.limit).toHaveBeenCalledWith(200);
  });

  it('builds the owner/admin list with search, lifecycle and stable sort', async () => {
    const ownerId = new Types.ObjectId().toString();
    const { clubModel, mongoQuery, query } = setup();

    await query.internal({
      ownerId,
      search: 'تهران',
      lifecycleStatus: [ClubLifecycleStatus.PENDING_REVIEW],
      operationalStatus: [ClubOperationalStatus.INACTIVE],
      sortBy: 'name',
      sortOrder: 'desc',
    });

    expect(clubModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: new Types.ObjectId(ownerId),
        'review.status': { $in: [ClubLifecycleStatus.PENDING_REVIEW] },
        operationalStatus: { $in: [ClubOperationalStatus.INACTIVE] },
        $and: [expect.objectContaining({ $or: expect.any(Array) })],
      }),
    );
    expect(mongoQuery.spies.sort).toHaveBeenCalledWith({
      'identity.name': -1,
      _id: -1,
    });
  });
});
