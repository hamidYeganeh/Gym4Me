import { Types } from 'mongoose';
import { mapDiscoveryCategoryFacetRows } from './discovery-club-facets';

describe('mapDiscoveryCategoryFacetRows', () => {
  it('maps category ids and drops empty or missing groups', () => {
    const gymId = new Types.ObjectId();

    expect(
      mapDiscoveryCategoryFacetRows([
        { _id: gymId, count: 12 },
        { _id: null, count: 3 },
        { _id: new Types.ObjectId(), count: 0 },
      ]),
    ).toEqual([{ id: gymId.toString(), count: 12 }]);
  });
});
