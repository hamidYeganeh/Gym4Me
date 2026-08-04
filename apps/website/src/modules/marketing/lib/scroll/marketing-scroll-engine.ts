import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  isCoarsePointer,
  locomotiveToScrollTriggerEdges,
  prefersReducedMotion,
} from "./marketing-scroll-utils";

gsap.registerPlugin(ScrollTrigger);

const INVIEW_CLASS = "is-inview";
const PROGRESS_VAR = "--progress";

type ScrollElementState = {
  el: HTMLElement;
  trigger: ScrollTrigger;
  isInview: boolean;
  scrollClass: string;
  scrollRepeat: boolean;
  scrollCall: string | null;
  scrollCssProgress: boolean;
  scrollEventProgress: string | null;
  scrollSpeed: number | null;
  enableTouchSpeed: boolean;
  ignoreFold: boolean;
  lastProgress: number | null;
};

function dispatchScrollCall(
  name: string,
  target: HTMLElement,
  way: "enter" | "leave",
  from: "start" | "end",
) {
  window.dispatchEvent(
    new CustomEvent(name, {
      detail: { target, way, from },
    }),
  );
}

function dispatchProgressEvent(name: string, target: HTMLElement, progress: number) {
  window.dispatchEvent(
    new CustomEvent(name, {
      detail: { target, progress },
    }),
  );
}

function applyParallax(
  el: HTMLElement,
  progress: number,
  speed: number,
  inFold: boolean,
) {
  const viewport = window.innerHeight;
  const y = inFold
    ? Math.max(0, progress) * viewport * speed * -1
    : gsap.utils.mapRange(0, 1, viewport * speed, -viewport * speed, progress);
  gsap.set(el, { y, force3D: true });
}

function clearParallax(el: HTMLElement) {
  gsap.set(el, { clearProps: "transform" });
}

function setInview(state: ScrollElementState, progress: number) {
  if (state.isInview) return;
  state.isInview = true;
  state.el.classList.add(state.scrollClass);
  if (state.scrollCall) {
    const from = progress < 0.5 ? "start" : "end";
    dispatchScrollCall(state.scrollCall, state.el, "enter", from);
  }
}

function setOutOfView(state: ScrollElementState, progress: number) {
  if (!(state.isInview && state.scrollRepeat)) return;
  state.isInview = false;
  state.el.classList.remove(state.scrollClass);
  if (state.scrollCall) {
    const from = progress < 0.5 ? "start" : "end";
    dispatchScrollCall(state.scrollCall, state.el, "leave", from);
  }
}

function onProgress(state: ScrollElementState, progress: number, inFold: boolean) {
  if (progress === state.lastProgress) return;
  state.lastProgress = progress;

  if (state.scrollCssProgress) {
    state.el.style.setProperty(PROGRESS_VAR, String(progress));
  }
  if (state.scrollEventProgress) {
    dispatchProgressEvent(state.scrollEventProgress, state.el, progress);
  }

  const allowParallax =
    state.scrollSpeed !== null &&
    (!isCoarsePointer() || state.enableTouchSpeed);

  if (allowParallax && state.scrollSpeed !== null) {
    applyParallax(state.el, progress, state.scrollSpeed, inFold);
  } else if (state.scrollSpeed !== null) {
    clearParallax(state.el);
  }

  if (progress > 0 && progress < 1) {
    setInview(state, progress);
  } else {
    setOutOfView(state, progress);
  }
}

function readScrollAttributes(el: HTMLElement) {
  const speedRaw = el.dataset.scrollSpeed;
  return {
    scrollClass: el.dataset.scrollClass ?? INVIEW_CLASS,
    scrollOffset: el.dataset.scrollOffset,
    scrollPosition: el.dataset.scrollPosition,
    scrollCssProgress: el.dataset.scrollCssProgress !== undefined,
    scrollEventProgress: el.dataset.scrollEventProgress ?? null,
    scrollSpeed:
      speedRaw !== undefined && speedRaw !== ""
        ? Number.parseFloat(speedRaw)
        : null,
    scrollRepeat: el.dataset.scrollRepeat !== undefined,
    scrollCall: el.dataset.scrollCall ?? null,
    ignoreFold: el.dataset.scrollIgnoreFold !== undefined,
    enableTouchSpeed: el.dataset.scrollEnableTouchSpeed !== undefined,
  };
}

function elementStartsInFold(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.top + window.scrollY < window.innerHeight;
}

/**
 * Bind every `[data-scroll]` under `root` to ScrollTrigger, matching
 * locomotive-scroll v5 progress / inview / parallax / call semantics.
 */
export function createMarketingScrollEngine(root: HTMLElement) {
  const states: ScrollElementState[] = [];
  const reduceMotion = prefersReducedMotion();

  const elements = Array.from(
    root.querySelectorAll<HTMLElement>("[data-scroll]"),
  );

  for (const el of elements) {
    const attrs = readScrollAttributes(el);
    const inFold = elementStartsInFold(el);

    const state: ScrollElementState = {
      el,
      trigger: null as unknown as ScrollTrigger,
      isInview: false,
      scrollClass: attrs.scrollClass,
      scrollRepeat: attrs.scrollRepeat,
      scrollCall: attrs.scrollCall,
      scrollCssProgress: attrs.scrollCssProgress,
      scrollEventProgress: attrs.scrollEventProgress,
      scrollSpeed:
        attrs.scrollSpeed !== null && !Number.isNaN(attrs.scrollSpeed)
          ? attrs.scrollSpeed
          : null,
      enableTouchSpeed: attrs.enableTouchSpeed,
      ignoreFold: attrs.ignoreFold,
      lastProgress: null,
    };

    const foldedNow = () => elementStartsInFold(el) && !state.ignoreFold;

    const resolveEdges = () =>
      locomotiveToScrollTriggerEdges({
        scrollOffset: attrs.scrollOffset,
        scrollPosition: attrs.scrollPosition,
        inFold: foldedNow(),
        ignoreFold: attrs.ignoreFold,
      });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: () => resolveEdges().start,
      end: () => resolveEdges().end,
      invalidateOnRefresh: true,
      onRefresh(self) {
        const folded = foldedNow();
        if (folded && self.progress === 0) {
          setInview(state, 0.001);
        }
        onProgress(state, self.progress, folded);
      },
      onUpdate(self) {
        if (
          reduceMotion &&
          !attrs.scrollCssProgress &&
          !attrs.scrollEventProgress &&
          state.scrollSpeed === null
        ) {
          if (self.progress > 0 && self.progress < 1) {
            setInview(state, self.progress);
          } else {
            setOutOfView(state, self.progress);
          }
          return;
        }
        onProgress(state, self.progress, foldedNow());
      },
    });

    state.trigger = trigger;
    states.push(state);

    onProgress(state, trigger.progress, inFold && !attrs.ignoreFold);
    if (inFold && !attrs.ignoreFold) {
      setInview(state, 0.001);
    }
  }

  return {
    refresh() {
      ScrollTrigger.refresh();
    },
    destroy() {
      for (const state of states) {
        state.trigger.kill();
        if (state.scrollCssProgress) {
          state.el.style.removeProperty(PROGRESS_VAR);
        }
        if (state.scrollSpeed !== null) {
          clearParallax(state.el);
        }
        state.el.classList.remove(state.scrollClass);
      }
      states.length = 0;
    },
  };
}

export type MarketingScrollEngine = ReturnType<typeof createMarketingScrollEngine>;
