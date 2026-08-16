"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ScrollSmootherReadyContext,
} from "./marketing-scroll-smoother";
import { applyLandingFontScale, usePrefersReducedMotion } from "./landing-motion";

type SmootherLike = {
  scrollTo: (
    target: string | number | Element,
    smooth?: boolean,
    position?: string,
  ) => void;
  paused: (value?: boolean) => boolean;
  kill: () => void;
  scrollTop: (value?: number) => number;
};

type LandingScrollApi = {
  ready: boolean;
  setReady: (v: boolean) => void;
  lockScroll: () => void;
  unlockScroll: () => void;
  scrollTo: (hash: string) => void;
  openContact: () => void;
  closeContact: () => void;
  contactOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  menuOpen: boolean;
  smootherReady: boolean;
};

const LandingScrollContext = createContext<LandingScrollApi | null>(null);

export function useLandingScroll() {
  const ctx = useContext(LandingScrollContext);
  if (!ctx) {
    throw new Error("useLandingScroll must be used within LandingScrollProvider");
  }
  return ctx;
}

export function LandingScrollProvider({
  children,
  overlays,
}: {
  children: ReactNode;
  /** Fixed UI outside ScrollSmoother content (loader, menu, modal). */
  overlays?: ReactNode;
}) {
  const smootherRef = useRef<SmootherLike | null>(null);
  const lockCount = useRef(0);
  const [ready, setReadyState] = useState(false);
  const readyRef = useRef(false);
  const [smootherReady, setSmootherReady] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = usePrefersReducedMotion();

  const applyLockClass = useCallback((locked: boolean) => {
    document.documentElement.classList.toggle("landing-scroll-lock", locked);
  }, []);

  const lockScroll = useCallback(() => {
    lockCount.current += 1;
    smootherRef.current?.paused(true);
    applyLockClass(true);
  }, [applyLockClass]);

  const unlockScroll = useCallback(() => {
    lockCount.current = Math.max(0, lockCount.current - 1);
    if (lockCount.current === 0) {
      smootherRef.current?.paused(false);
      applyLockClass(false);
    }
  }, [applyLockClass]);

  const setReady = useCallback(
    (v: boolean) => {
      readyRef.current = v;
      setReadyState(v);
      if (v) {
        lockCount.current = 0;
        smootherRef.current?.paused(false);
        applyLockClass(false);
        requestAnimationFrame(() => {
          void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
            ScrollTrigger.refresh();
          });
        });
      }
    },
    [applyLockClass],
  );

  const openContact = useCallback(() => {
    setContactOpen(true);
    lockScroll();
  }, [lockScroll]);

  const closeContact = useCallback(() => {
    setContactOpen(false);
    unlockScroll();
  }, [unlockScroll]);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    lockScroll();
  }, [lockScroll]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    unlockScroll();
  }, [unlockScroll]);

  const scrollTo = useCallback((hash: string) => {
    const id = hash.replace(/^#/, "");
    const el = document.getElementById(id);
    if (!el) return;
    const smoother = smootherRef.current;
    if (smoother) {
      smoother.scrollTo(el, true, "top top");
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.classList.add("landing-page");
    const onResize = () => {
      applyLandingFontScale(document.documentElement);
    };
    onResize();
    window.addEventListener("resize", onResize);

    let cancelled = false;
    let revertMm: (() => void) | undefined;

    async function boot() {
      const [{ gsap }, { ScrollSmoother }, { ScrollTrigger }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollSmoother"),
          import("gsap/ScrollTrigger"),
        ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
      ScrollTrigger.config({ ignoreMobileResize: true });

      if (reduced) {
        ScrollSmoother.get()?.kill();
        setSmootherReady(true);
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        ScrollSmoother.get()?.kill();
        const smoother = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1,
          effects: true,
          normalizeScroll: true,
        }) as unknown as SmootherLike;
        smootherRef.current = smoother;
        if (!readyRef.current) smoother.paused(true);
        setSmootherReady(true);
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => {
          smoother.kill();
          if (smootherRef.current === smoother) smootherRef.current = null;
        };
      });

      mm.add("(max-width: 767px)", () => {
        ScrollSmoother.get()?.kill();
        smootherRef.current = null;
        setSmootherReady(true);
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });

      revertMm = () => mm.revert();
    }

    void boot();

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      document.documentElement.classList.remove("landing-page");
      document.documentElement.style.removeProperty("font-size");
      revertMm?.();
      smootherRef.current = null;
      applyLockClass(false);
      setSmootherReady(false);
    };
    // ready intentionally omitted — pause state handled in setReady/lock
  }, [applyLockClass, reduced]);

  const api = useMemo<LandingScrollApi>(
    () => ({
      ready,
      setReady,
      lockScroll,
      unlockScroll,
      scrollTo,
      openContact,
      closeContact,
      contactOpen,
      openMenu,
      closeMenu,
      menuOpen,
      smootherReady,
    }),
    [
      ready,
      setReady,
      lockScroll,
      unlockScroll,
      scrollTo,
      openContact,
      closeContact,
      contactOpen,
      openMenu,
      closeMenu,
      menuOpen,
      smootherReady,
    ],
  );

  return (
    <LandingScrollContext.Provider value={api}>
      <ScrollSmootherReadyContext.Provider value={smootherReady}>
        <div id="smooth-wrapper" className="landing-smooth-wrapper">
          <div id="smooth-content" className="landing-smooth-content">
            {children}
          </div>
        </div>
        {overlays}
      </ScrollSmootherReadyContext.Provider>
    </LandingScrollContext.Provider>
  );
}
