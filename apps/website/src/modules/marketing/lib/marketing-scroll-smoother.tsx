"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

const ScrollSmootherReadyContext = createContext(true);

/** True once scroll setup exists (smoother on desktop, native on mobile). */
export function useScrollSmootherReady() {
  return useContext(ScrollSmootherReadyContext);
}

export function ScrollSmootherProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      ScrollSmoother.get()?.kill();
      setIsReady(true);
      return;
    }

    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      ScrollSmoother.get()?.kill();

      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1,
        effects: true,
        normalizeScroll: true,
      });

      setIsReady(true);
      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        smoother.kill();
      };
    });

    mm.add("(max-width: 767px)", () => {
      ScrollSmoother.get()?.kill();
      setIsReady(true);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    return () => {
      mm.revert();
      setIsReady(false);
    };
  });

  return (
    <ScrollSmootherReadyContext.Provider value={isReady}>
      <div id="smooth-wrapper">
        <div id="smooth-content">{children}</div>
      </div>
    </ScrollSmootherReadyContext.Provider>
  );
}
