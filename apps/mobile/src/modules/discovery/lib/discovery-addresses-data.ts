/** Saved / selectable addresses for discovery location chip. */

export type DiscoveryAddressItem = {
  id: string;
  /** Short chip / list title (e.g. home, work). */
  label: string;
  /** Full address line shown in the sheet. */
  line: string;
  /** City used for discovery context (chip + filters). */
  city: string;
};

export function formatAddressLine(parts: {
  street?: string | null;
  apartment?: string | null;
  city?: string | null;
}): string | null {
  const line = [parts.street, parts.apartment, parts.city]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join("، ");
  return line.length > 0 ? line : null;
}
