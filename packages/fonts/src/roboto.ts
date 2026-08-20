import localFont from "next/font/local";

/** Roboto for Latin brand marks (splash, wordmark). */
export const roboto = localFont({
  src: [
    {
      path: "../files/Roboto-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../files/Roboto-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-roboto-family",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});
