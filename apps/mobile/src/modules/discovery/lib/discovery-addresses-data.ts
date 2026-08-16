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

export const DISCOVERY_MOCK_ADDRESSES: DiscoveryAddressItem[] = [
  {
    id: "home",
    label: "خانه",
    line: "تهران، سعادت‌آباد، بلوار دریا، پلاک ۱۲",
    city: "تهران",
  },
  {
    id: "work",
    label: "محل کار",
    line: "تهران، ونک، خیابان ملاصدرا، برج آسمان",
    city: "تهران",
  },
  {
    id: "gym-area",
    label: "نزدیک باشگاه",
    line: "تهران، جردن، خیابان ولیعصر، کوچه گلستان",
    city: "تهران",
  },
];

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
