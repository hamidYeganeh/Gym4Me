/**
 * Header theme sync — locomotive `changeHeaderTheme` scroll call.
 * On enter, reads the toggler's parent `[data-theme]` onto `<html>`.
 */
export function initHeaderThemeModule() {
  const onChange = (event: Event) => {
    const { target, way } = (
      event as CustomEvent<{ target: HTMLElement; way: string }>
    ).detail;
    if (way !== "enter") return;
    const theme = target.parentElement?.getAttribute("data-theme");
    if (theme) {
      document.documentElement.setAttribute("data-header-theme", theme);
    }
  };

  window.addEventListener("changeHeaderTheme", onChange);
  return () => {
    window.removeEventListener("changeHeaderTheme", onChange);
  };
}
