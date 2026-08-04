import gsap from "gsap";

type RailItemData = {
  left: number;
  width: number;
  translate: number;
};

/**
 * Marquee rail — locomotive `data-module-rail` + `toggleRail` scroll call.
 * Idle ticker + scroll-velocity boost, clones pattern to fill viewport.
 */
export function initRailModules(root: HTMLElement) {
  const rails = Array.from(
    root.querySelectorAll<HTMLElement>("[data-module-rail]"),
  );

  const cleanups = rails.map((el) => {
    const container = el.querySelector<HTMLElement>('[data-rail="container"]');
    const pattern = el.querySelector<HTMLElement>('[data-rail="pattern"]');
    if (!container || !pattern) return () => undefined;

    const railDirection = Number(el.dataset.railDirection ?? "1") || 1;
    let prevCount: number | null = null;
    let currentTranslate = 0;
    let maxTranslate = container.offsetWidth;
    const idleVelocity = 1;
    let scrollVelocity = 0.1;
    const scrollLerp = 0.8;
    let scrollDirection = 1;
    let isPlaying = false;
    let data: RailItemData[] = [];
    let items: HTMLElement[] = [];

    const computeMetrics = (reset = false) => {
      if (reset) {
        items = Array.from(
          el.querySelectorAll<HTMLElement>("[data-rail-item]"),
        );
        data = [];
        currentTranslate = 0;
        items.forEach((item) => {
          const rect = item.getBoundingClientRect();
          const parentRect = container.getBoundingClientRect();
          data.push({
            left: rect.left - parentRect.left - currentTranslate,
            width: rect.width,
            translate: 0,
          });
        });
        // Re-read after layout with scroll offset 0.
        items.forEach((item, index) => {
          const left = item.offsetLeft;
          data[index] = {
            left,
            width: item.offsetWidth,
            translate: 0,
          };
        });
      }
    };

    const repeatPattern = () => {
      const patternWidth = pattern.offsetWidth || 1;
      const count = Math.ceil(window.innerWidth / patternWidth) + 1;
      maxTranslate = count * patternWidth;
      if (count === prevCount) {
        computeMetrics();
        return;
      }
      prevCount = count;

      container.querySelectorAll("[data-clone]").forEach((node) => node.remove());

      for (let i = 0; i < count - 1; i++) {
        const clone = pattern.cloneNode(true) as HTMLElement;
        clone.setAttribute("data-clone", "");
        clone.setAttribute("aria-hidden", "true");
        container.appendChild(clone);
      }

      requestAnimationFrame(() => computeMetrics(true));
    };

    const onUpdate = () => {
      // Lenis velocity decays toward 0 while idle; approximate that here.
      scrollVelocity *= 0.9;
      if (scrollVelocity < 0.1) scrollVelocity = 0.1;

      currentTranslate =
        (currentTranslate +
          idleVelocity * scrollDirection * railDirection +
          scrollVelocity * scrollDirection * railDirection) %
        maxTranslate;

      items.forEach((item, index) => {
        const entry = data[index];
        if (!entry) return;
        const edge = entry.left + entry.width;
        let wrap = 0;
        if (currentTranslate < edge * -1) wrap = maxTranslate;
        else if (currentTranslate > maxTranslate - edge) wrap = -maxTranslate;
        entry.translate = wrap;
        item.style.transform = `translate3d(${wrap}px,0,0)`;
      });

      container.style.transform = `translate3d(${currentTranslate}px,0,0)`;
    };

    const start = () => {
      if (isPlaying) return;
      isPlaying = true;
      gsap.ticker.add(onUpdate);
    };

    const stop = () => {
      if (!isPlaying) return;
      isPlaying = false;
      gsap.ticker.remove(onUpdate);
    };

    const onToggle = (event: Event) => {
      const { way } = (event as CustomEvent<{ way: string }>).detail;
      if (way === "enter") start();
      else stop();
    };

    let lastScrollY = window.scrollY;
    const onWindowScroll = () => {
      if (isCoarse()) return;
      const y = window.scrollY;
      const delta = y - lastScrollY;
      lastScrollY = y;
      const direction = delta === 0 ? scrollDirection : delta > 0 ? 1 : -1;
      // Match locomotive: invert direction for rail travel vs scroll.
      scrollDirection = direction * -1;
      scrollVelocity = Math.round(Math.abs(delta)) * scrollLerp;
    };

    const isCoarse = () =>
      window.matchMedia("(any-pointer: coarse)").matches;

    const onResize = () => repeatPattern();

    window.addEventListener("toggleRail", onToggle);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onWindowScroll, { passive: true });

    repeatPattern();

    return () => {
      stop();
      window.removeEventListener("toggleRail", onToggle);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onWindowScroll);
      container.querySelectorAll("[data-clone]").forEach((node) => node.remove());
      container.style.transform = "";
    };
  });

  return () => {
    for (const destroy of cleanups) destroy();
  };
}
