export type ProductionProviderGuard = {
  nodeEnv: string | undefined;
  provider: string;
  allowed: readonly string[];
  configKey: string;
};

/** Prevent development/mock drivers from ever starting in production. */
export function assertProductionProvider({
  nodeEnv,
  provider,
  allowed,
  configKey,
}: ProductionProviderGuard): void {
  if (nodeEnv === 'production' && !allowed.includes(provider)) {
    throw new Error(
      `${configKey}=${provider} is not allowed in production; expected ${allowed.join(' or ')}`,
    );
  }
}
