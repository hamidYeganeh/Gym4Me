/** Introduce carousel slides (hero Get Started lives on `/welcome`). */
export const WELCOME_INTRODUCE_SLIDES = [
  { imageSrc: "/welcome/hero-athletes.png" },
  { imageSrc: "/onboarding-fitness.png" },
  { imageSrc: "/demo/metrics-promo.png" },
  { imageSrc: "/onboarding-personal.png" },
] as const;

export const WELCOME_INTRODUCE_SLIDE_COUNT = WELCOME_INTRODUCE_SLIDES.length;
