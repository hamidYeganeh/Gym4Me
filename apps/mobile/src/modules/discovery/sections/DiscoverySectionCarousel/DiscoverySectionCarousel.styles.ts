import { tv } from "tailwind-variants";

import { discoveryHomeCarouselClassNames } from "../../lib/discovery-home-carousel";

export const discoverySectionCarouselVariants = tv({
  slots: {
    swiper: discoveryHomeCarouselClassNames.swiper,
    slide: discoveryHomeCarouselClassNames.slide,
  },
});
