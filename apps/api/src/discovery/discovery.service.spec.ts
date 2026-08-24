import type Redis from 'ioredis';
import { Role } from '../common/enums';
import {
  DiscoveryAuthenticationTarget,
  DiscoveryEmptyBehavior,
  DiscoveryInterestMatch,
} from './discovery.constants';
import { DiscoveryService } from './discovery.service';
import { isDiscoverySectionEligible } from './discovery-targeting.policy';
import type {
  DiscoveryFeedSession,
  DiscoveryPersonalizationContext,
  DiscoverySectionDefinition,
} from './discovery.types';

function makeService(redis: Pick<Redis, 'get' | 'expire' | 'set'>) {
  const model = {} as never;
  return new DiscoveryService(
    model,
    model,
    model,
    model,
    model,
    model,
    model,
    model,
    model,
    redis as Redis,
    { log: jest.fn() } as never,
  );
}

function emptySection(index: number): DiscoverySectionDefinition {
  return {
    id: `section-${index}`,
    kind: 'unknown' as never,
    content: { title: `Section ${index}` },
    source: { strategy: 'featured' as never, limit: 1 },
    presentation: { component: 'test', layout: 'horizontal' },
    emptyBehavior: DiscoveryEmptyBehavior.SHOW_EMPTY,
  };
}

describe('DiscoveryService feed policy', () => {
  it('keeps section pagination pinned to a feed token', async () => {
    const session: DiscoveryFeedSession = {
      pageKey: 'discovery_home',
      subject: 'user-1',
      revision: 4,
      schemaVersion: 1,
      sections: Array.from({ length: 17 }, (_, index) => emptySection(index)),
      personalization: {
        authenticated: true,
        activeRole: Role.ATHLETE,
        sportIds: ['yoga'],
        goalKeys: [],
      },
      context: {},
      createdAt: '2026-08-24T00:00:00.000Z',
    };
    const redis = {
      get: jest.fn((key: string) =>
        Promise.resolve(
          key.startsWith('discovery:feed:') ? JSON.stringify(session) : null,
        ),
      ),
      expire: jest.fn().mockResolvedValue(1),
      set: jest.fn(),
    };
    const service = makeService(redis);

    const response = await service.getFeed(
      { page: 2, page_size: 8, feed_token: 'stable-token' },
      {
        sub: 'user-1',
        phone: '+989000000000',
        roles: [Role.ATHLETE],
        activeRole: Role.ATHLETE,
      },
    );

    expect(response.result).toHaveLength(8);
    expect(response.result[0]?.id).toBe('section-8');
    expect(response.pagination.next).toBe(3);
    expect(response.meta.revision).toBe(4);
  });

  it('rejects a token owned by a different subject', async () => {
    const session: DiscoveryFeedSession = {
      pageKey: 'discovery_home',
      subject: 'user-2',
      revision: 1,
      schemaVersion: 1,
      sections: [],
      personalization: { authenticated: true, sportIds: [], goalKeys: [] },
      context: {},
      createdAt: new Date().toISOString(),
    };
    const service = makeService({
      get: jest.fn().mockResolvedValue(JSON.stringify(session)),
      expire: jest.fn().mockResolvedValue(1),
      set: jest.fn(),
    });

    await expect(
      service.getFeed(
        { page: 2, feed_token: 'other-user-token' },
        {
          sub: 'user-1',
          phone: '+989000000000',
          roles: [Role.ATHLETE],
          activeRole: Role.ATHLETE,
        },
      ),
    ).rejects.toThrow('feed_token does not match this feed');
  });

  it('matches configured interests with any/all semantics', () => {
    const context: DiscoveryPersonalizationContext = {
      authenticated: true,
      activeRole: Role.ATHLETE,
      sportIds: ['yoga'],
      goalKeys: ['flexibility'],
    };
    const base = emptySection(1);

    expect(
      isDiscoverySectionEligible(
        {
          ...base,
          targeting: {
            authentication: DiscoveryAuthenticationTarget.REQUIRED,
            activeRoles: [Role.ATHLETE],
            sportIds: ['yoga', 'boxing'],
            match: DiscoveryInterestMatch.ANY,
          },
        },
        context,
      ),
    ).toBe(true);
    expect(
      isDiscoverySectionEligible(
        {
          ...base,
          targeting: {
            sportIds: ['yoga', 'boxing'],
            match: DiscoveryInterestMatch.ALL,
          },
        },
        context,
      ),
    ).toBe(false);
  });
});
