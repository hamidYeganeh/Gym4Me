import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * Footer attribute columns — locomotive `data-module-randomize` + `randomize` call.
 * Scrambles each `<p>` on enter.
 */
export function initRandomizeModules(root: HTMLElement) {
  const modules = Array.from(
    root.querySelectorAll<HTMLElement>("[data-module-randomize]"),
  );

  const onRandomize = (event: Event) => {
    const { target } = (event as CustomEvent<{ target: HTMLElement }>).detail;
    const owner = modules.find((module) => module.contains(target));
    if (!owner || !owner.contains(target)) return;

    const paragraphs = Array.from(target.querySelectorAll("p"));
    paragraphs.forEach((paragraph, index) => {
      const text = paragraph.textContent ?? "";
      gsap.to(paragraph, { opacity: 1, duration: 0, delay: 0.1 * index });
      gsap.to(paragraph, {
        scrambleText: text,
        duration: 1.5,
        delay: 0.1 * index,
      });
    });
  };

  window.addEventListener("randomize", onRandomize);
  return () => {
    window.removeEventListener("randomize", onRandomize);
  };
}
