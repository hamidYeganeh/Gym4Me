import { discoveryPageLayoutStyles } from "../../lib/discovery-page-layout";

export const discoveryHomeScreenStyles = discoveryPageLayoutStyles;

export {
  HOME_SPORT_THEMES,
} from "../../sections/DiscoveryHomeSportsSection/DiscoveryHomeSportsSection.styles";

import { HOME_SPORT_THEMES } from "../../sections/DiscoveryHomeSportsSection/DiscoveryHomeSportsSection.styles";

/** @deprecated Prefer HOME_SPORT_THEMES */
export const HOME_SPORT_COLORS = HOME_SPORT_THEMES.map((theme) => theme.color);
