export function resolveDemoMode(
  nodeEnv: string | undefined,
  publicFlag: string | undefined,
): boolean {
  return (
    nodeEnv !== "production" && publicFlag?.trim().toLowerCase() === "true"
  );
}

/**
 * Explicit, build-time demo switch. The production bundle can never enable it,
 * even when NEXT_PUBLIC_DEMO_MODE is accidentally configured as true.
 */
export const DEMO_MODE = resolveDemoMode(
  process.env.NEXT_PUBLIC_BUILD_ENV,
  process.env.NEXT_PUBLIC_DEMO_MODE,
);

export const STATIC_EXPORT_PLACEHOLDER_ID = "000000000000000000000000";

export function canUseDemoFixtureId(id: string, demoMode = DEMO_MODE): boolean {
  return demoMode && !/^[a-f\d]{24}$/i.test(id);
}

export function buildDemoStaticParams<T>(
  build: () => T[],
  productionParams: T[],
  demoMode = DEMO_MODE,
): T[] {
  return demoMode ? build() : productionParams;
}
