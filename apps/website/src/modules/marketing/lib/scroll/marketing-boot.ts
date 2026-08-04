/**
 * Viewport CSS vars + load/ready class sequence (locomotive landing boot).
 */

export function syncViewportCssVars() {
  const root = document.documentElement;
  root.style.setProperty("--vw", `${root.offsetWidth * 0.01}px`);
  root.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
}

export function syncVhInitial() {
  document.documentElement.style.setProperty(
    "--vh-initial",
    `${window.innerHeight * 0.01}px`,
  );
}

/**
 * Matches locomotive boot:
 * after ~100ms → is-first-loaded + is-loaded, remove is-loading
 * after +100ms → is-ready (hero words + preloader fade)
 */
export function runMarketingLoadSequence() {
  const html = document.documentElement;
  html.classList.add("is-loading");
  html.classList.remove("is-loaded", "is-ready", "is-first-loaded");

  syncVhInitial();
  syncViewportCssVars();

  const t1 = window.setTimeout(() => {
    html.classList.add("is-first-loaded", "is-loaded");
    html.classList.remove("is-loading");
    window.setTimeout(() => {
      html.classList.add("is-ready");
    }, 100);
  }, 100);

  const onResize = () => syncViewportCssVars();
  window.addEventListener("resize", onResize);

  return () => {
    window.clearTimeout(t1);
    window.removeEventListener("resize", onResize);
  };
}

export function bindScrollingDirection() {
  const html = document.documentElement;
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    if (y < lastY) html.classList.add("is-scrolling-up");
    else html.classList.remove("is-scrolling-up");
    lastY = y;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}
