import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

type LineMetric = { from: number; to: number };

/**
 * Footer “thanks” block — locomotive `progressEvent` + SplitText line scrub
 * (x: -25→0, opacity: 0→1 per line).
 */
export function initFooterProgressModules(root: HTMLElement) {
  const nodes = Array.from(
    root.querySelectorAll<HTMLElement>(
      '[data-scroll-event-progress="progressEvent"]',
    ),
  );

  const instances = nodes.map((el) => {
    let split: SplitText | null = null;
    let metrics: LineMetric[] = [];

    const computeMetrics = (instance: SplitText) => {
      metrics = instance.lines.map((_, index, arr) => {
        const from = index / arr.length;
        return { from, to: from + 1 / arr.length };
      });
    };

    const onProgress = (event: Event) => {
      if (!split?.lines) return;
      const { progress } = (
        event as CustomEvent<{ progress: number }>
      ).detail;
      split.lines.forEach((line, index) => {
        const metric = metrics[index];
        if (!metric) return;
        const x = gsap.utils.clamp(
          -25,
          0,
          gsap.utils.mapRange(metric.from, metric.to, -25, 0, progress),
        );
        const opacity = gsap.utils.clamp(
          0,
          1,
          gsap.utils.mapRange(metric.from, metric.to, 0, 1, progress),
        );
        gsap.set(line, { x, opacity });
      });
    };

    split = SplitText.create(el, {
      type: "lines",
      tag: "span",
      autoSplit: true,
      onSplit(self) {
        computeMetrics(self);
      },
    });
    computeMetrics(split);
    // Start hidden (progress 0).
    onProgress(
      new CustomEvent("progressEvent", { detail: { progress: 0 } }),
    );
    window.addEventListener("progressEvent", onProgress);

    return () => {
      window.removeEventListener("progressEvent", onProgress);
      split?.revert();
    };
  });

  return () => {
    for (const destroy of instances) destroy();
  };
}
