import {
  DiscoveryAuthenticationTarget,
  DiscoveryInterestMatch,
} from './discovery.constants';
import type {
  DiscoveryPersonalizationContext,
  DiscoverySectionDefinition,
} from './discovery.types';

export function isDiscoverySectionEligible(
  section: DiscoverySectionDefinition,
  context: DiscoveryPersonalizationContext,
): boolean {
  const target = section.targeting;
  if (!target) return true;
  const auth = target.authentication ?? DiscoveryAuthenticationTarget.ALL;
  if (auth === DiscoveryAuthenticationTarget.GUEST && context.authenticated) {
    return false;
  }
  if (
    auth === DiscoveryAuthenticationTarget.REQUIRED &&
    !context.authenticated
  ) {
    return false;
  }
  if (
    target.activeRoles?.length &&
    (!context.activeRole || !target.activeRoles.includes(context.activeRole))
  ) {
    return false;
  }
  const checks = [
    ...(target.sportIds?.length
      ? target.sportIds.map((id) => context.sportIds.includes(id))
      : []),
    ...(target.goalKeys?.length
      ? target.goalKeys.map((key) => context.goalKeys.includes(key))
      : []),
  ];
  if (checks.length === 0) return true;
  return (target.match ?? DiscoveryInterestMatch.ANY) ===
    DiscoveryInterestMatch.ALL
    ? checks.every(Boolean)
    : checks.some(Boolean);
}
