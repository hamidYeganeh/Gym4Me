export const discoveryHomeScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-10 pb-14 pt-2",
} as const;

export {
  HOME_SPORT_THEMES,
} from "../../sections/DiscoveryHomeSportsSection/DiscoveryHomeSportsSection.styles";

import { HOME_SPORT_THEMES } from "../../sections/DiscoveryHomeSportsSection/DiscoveryHomeSportsSection.styles";

/** @deprecated Prefer HOME_SPORT_THEMES */
export const HOME_SPORT_COLORS = HOME_SPORT_THEMES.map(
  (theme) => theme.color,
) as unknown as readonly [
  "var(--accent)",
  "var(--stats-blue)",
  "var(--stats-orange)",
  "var(--foreground)",
];
