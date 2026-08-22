/** Accept only absolute HTTPS store URLs from public build-time configuration. */
export function resolveStoreUrl(value?: string | null): string | undefined {
  const candidate = value?.trim();
  if (!candidate) return undefined;

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
