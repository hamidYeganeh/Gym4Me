import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

/**
 * Smooth in-page anchors (replaces locomotive scrollTo on `#` links).
 */
export function initAnchorScroll(root: HTMLElement) {
  const onClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a[href^='#']");
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const hash = anchor.getAttribute("href");
    if (!hash || hash === "#") return;
    const el = root.querySelector(hash) ?? document.querySelector(hash);
    if (!el) return;

    event.preventDefault();
    gsap.to(window, {
      duration: 1,
      ease: "power2.inOut",
      scrollTo: { y: el, autoKill: true },
    });
  };

  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}
