import { SportKind } from '../../common/enums';
import { DEFAULT_SPORT_TREE, type SportDefaultNode } from './sport-defaults';

describe('DEFAULT_SPORT_TREE', () => {
  const flatten = (nodes: SportDefaultNode[]): SportDefaultNode[] =>
    nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);

  const all = flatten(DEFAULT_SPORT_TREE);

  it('has valid hierarchy, unique slugs per kind and sequential sibling order', () => {
    const walk = (nodes: SportDefaultNode[], expectedKind: SportKind) => {
      expect(nodes.map((node) => node.order)).toEqual(
        nodes.map((_, index) => index),
      );
      for (const node of nodes) {
        expect(node.kind).toBe(expectedKind);
        if (node.children) {
          const childKind =
            expectedKind === SportKind.CATEGORY
              ? SportKind.SPORT
              : SportKind.BRANCH;
          walk(node.children, childKind);
        }
      }
    };

    walk(DEFAULT_SPORT_TREE, SportKind.CATEGORY);
    for (const kind of Object.values(SportKind)) {
      const slugs = all
        .filter((node) => node.kind === kind)
        .map((node) => node.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it('covers a broad multi-sport launch catalog', () => {
    expect(
      all.filter((node) => node.kind === SportKind.CATEGORY).length,
    ).toBeGreaterThanOrEqual(12);
    expect(
      all.filter((node) => node.kind === SportKind.SPORT).length,
    ).toBeGreaterThanOrEqual(70);
    expect(
      all.filter((node) => node.kind === SportKind.BRANCH).length,
    ).toBeGreaterThanOrEqual(50);
  });
});
