import { DiscoverySectionKind } from './discovery.constants';
import { INITIAL_DISCOVERY_HOME_SECTIONS } from './discovery.initial-sections';

describe('initial discovery home sections', () => {
  it('installs every expanded marketplace kind with unique editable ids', () => {
    const ids = INITIAL_DISCOVERY_HOME_SECTIONS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    const kinds = new Set(
      INITIAL_DISCOVERY_HOME_SECTIONS.map((section) => section.kind),
    );
    for (const kind of [
      DiscoverySectionKind.COACHES,
      DiscoverySectionKind.CLASSES,
      DiscoverySectionKind.SPACES,
      DiscoverySectionKind.SLOTS,
      DiscoverySectionKind.EQUIPMENT,
      DiscoverySectionKind.MEMBERSHIP_PLANS,
      DiscoverySectionKind.BOOKABLE_OFFERS,
      DiscoverySectionKind.AMENITIES,
      DiscoverySectionKind.LOCATIONS,
    ]) {
      expect(kinds).toContain(kind);
    }
  });
});
