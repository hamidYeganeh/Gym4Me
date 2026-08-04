"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import {
  bindScrollingDirection,
  runMarketingLoadSequence,
  syncViewportCssVars,
} from "./marketing-boot";
import { initAnchorScroll } from "./marketing-anchor-scroll";
import { initFadeInTextModules } from "./marketing-fade-in-text";
import { initFooterProgressModules } from "./marketing-footer-progress";
import { initHeaderThemeModule } from "./marketing-header-theme";
import { initRandomizeModules } from "./marketing-randomize";
import { initRailModules } from "./marketing-rail";
import { createMarketingScrollEngine } from "./marketing-scroll-engine";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Boots the marketing landing scroll stack:
 * ScrollTrigger (data-scroll) + fade-in / rail / scramble / header theme.
 */
export function useMarketingScroll() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const stopBoot = runMarketingLoadSequence();
      const stopDirection = bindScrollingDirection();
      const stopHeaderTheme = initHeaderThemeModule();
      const stopFadeIn = initFadeInTextModules(root);
      const stopFooterProgress = initFooterProgressModules(root);
      const stopRandomize = initRandomizeModules(root);
      const stopRail = initRailModules(root);
      const stopAnchors = initAnchorScroll(root);
      const engine = createMarketingScrollEngine(root);

      // Fonts / images can shift layout — refresh once settled.
      const refresh = () => {
        syncViewportCssVars();
        engine.refresh();
      };
      const fontsReady =
        "fonts" in document
          ? document.fonts.ready.then(refresh).catch(() => undefined)
          : Promise.resolve();
      const lateRefresh = window.setTimeout(refresh, 400);

      void fontsReady;

      return () => {
        window.clearTimeout(lateRefresh);
        engine.destroy();
        stopAnchors();
        stopRail();
        stopRandomize();
        stopFooterProgress();
        stopFadeIn();
        stopHeaderTheme();
        stopDirection();
        stopBoot();
      };
    },
    { scope: rootRef },
  );

  return rootRef;
}
