import localFont from "next/font/local";

/**
 * IRANSansX variable font (wght 100–1000).
 * Apply `DOTS` via CSS: `font-variation-settings: "DOTS" 8`
 * (max sharpness / thinner strokes — see IranSansX Help).
 */
export const iranSansX = localFont({
  src: "../files/IRANSansXV.woff2",
  weight: "100 1000",
  style: "normal",
  variable: "--font-iran-sans-x",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
  adjustFontFallback: false,
});

/** Maximum DOTS axis value for IRANSansX variable font. */
export const IRAN_SANS_X_DOTS = 8;

/** CSS value for the DOTS axis at maximum sharpness. */
export const iranSansXDotsSettings = `"DOTS" ${IRAN_SANS_X_DOTS}` as const;
