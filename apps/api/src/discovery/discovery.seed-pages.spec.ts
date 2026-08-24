import {
  DISCOVERY_MAX_ITEMS_PER_SECTION,
  DISCOVERY_MAX_SECTIONS,
  DiscoverySectionKind,
} from './discovery.constants';
import {
  appendMissingDiscoverySeedSections,
  DISCOVERY_SEED_PAGE_KEYS,
  DISCOVERY_SEED_PAGES,
} from './discovery.seed-pages';

describe('discovery seed pages', () => {
  it('defines a valid, non-empty section list for every admin page', () => {
    expect(Object.keys(DISCOVERY_SEED_PAGES).sort()).toEqual(
      [...DISCOVERY_SEED_PAGE_KEYS].sort(),
    );

    for (const pageKey of DISCOVERY_SEED_PAGE_KEYS) {
      const sections = DISCOVERY_SEED_PAGES[pageKey];
      expect(sections.length).toBeGreaterThan(0);
      expect(sections.length).toBeLessThanOrEqual(DISCOVERY_MAX_SECTIONS);
      expect(new Set(sections.map((item) => item.id)).size).toBe(
        sections.length,
      );
      for (const item of sections) {
        expect(item.source.limit).toBeGreaterThan(0);
        expect(item.source.limit).toBeLessThanOrEqual(
          DISCOVERY_MAX_ITEMS_PER_SECTION,
        );
      }
    }
  });

  it('publishes all expanded marketplace kinds on the seeded home', () => {
    const kinds = new Set(
      DISCOVERY_SEED_PAGES.discovery_home.map((section) => section.kind),
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
    ]) {
      expect(kinds).toContain(kind);
    }
  });

  it('preserves admin sections and only appends missing seeded sections', () => {
    const seeded = DISCOVERY_SEED_PAGES.discovery_home;
    const customized = {
      ...seeded[0],
      content: { ...seeded[0].content, title: 'عنوان انتخابی ادمین' },
    };

    const merged = appendMissingDiscoverySeedSections(
      [customized, seeded[1]],
      seeded,
    );

    expect(merged).toHaveLength(seeded.length);
    expect(merged[0].content.title).toBe('عنوان انتخابی ادمین');
    expect(merged.map((section) => section.id)).toEqual(
      seeded.map((section) => section.id),
    );
  });
});
