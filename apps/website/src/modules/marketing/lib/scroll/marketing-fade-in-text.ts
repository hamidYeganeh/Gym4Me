import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

type LineMetric = { from: number; to: number };

/**
 * Locomotive `data-module-fade-in-text` — SplitText lines with scroll-scrubbed
 * gradient reveal driven by `fadeinTextProgress` custom events.
 */
export function initFadeInTextModules(root: HTMLElement) {
  const nodes = Array.from(
    root.querySelectorAll<HTMLElement>("[data-module-fade-in-text]"),
  );

  const instances = nodes.map((el) => {
    let split: SplitText | null = null;
    let metrics: LineMetric[] = [];
    let progress = 0;

    const baseColor = getComputedStyle(el)
      .getPropertyValue("--color-cta-fadein")
      .trim();
    const targetColor = getComputedStyle(el).getPropertyValue("--color").trim();

    const computeMetrics = (instance: SplitText) => {
      metrics = [];
      const widths = instance.lines.map(
        (line) => (line as HTMLElement).getBoundingClientRect().width,
      );
      const total = widths.reduce((sum, w) => sum + w, 0) || 1;
      let cursor = 0;
      for (let i = 0; i < instance.lines.length; i++) {
        const from = cursor / total;
        const share = widths[i]! / total;
        cursor += widths[i]!;
        metrics.push({ from, to: from + share });
      }
    };

    const updateGradient = (line: HTMLElement, lineProgress: number) => {
      const mapped = gsap.utils.mapRange(0, 1, -100, 200, lineProgress);
      const softStart = Math.max(mapped - 100, 0);
      const softEnd = Math.min(mapped + 100, 100);
      const background = `linear-gradient(to right, ${targetColor} 0%, ${targetColor} ${softStart}%, ${targetColor} ${mapped}%, ${baseColor} ${softEnd}%, ${baseColor} 100%)`;
      line.style.setProperty("--background", background);
    };

    const computeProgress = () => {
      if (!split) return;
      for (let i = 0; i < split.lines.length; i++) {
        const line = split.lines[i] as HTMLElement;
        const metric = metrics[i];
        if (!metric) continue;
        const lineProgress = gsap.utils.clamp(
          0,
          1,
          gsap.utils.mapRange(metric.from, metric.to, 0, 1, progress),
        );
        line.style.setProperty("--progress", String(lineProgress));
        updateGradient(line, lineProgress);
      }
    };

    const onProgress = (event: Event) => {
      const { target, progress: next } = (
        event as CustomEvent<{ target: HTMLElement; progress: number }>
      ).detail;
      if (!el.contains(target) || !split) return;
      progress = next;
      computeProgress();
    };

    split = SplitText.create(el, {
      type: "lines",
      linesClass: "c-fadein-text_line",
      autoSplit: true,
      onSplit(self) {
        computeMetrics(self);
        requestAnimationFrame(() => computeProgress());
      },
    });
    computeMetrics(split);
    window.addEventListener("fadeinTextProgress", onProgress);

    return () => {
      window.removeEventListener("fadeinTextProgress", onProgress);
      split?.revert();
    };
  });

  return () => {
    for (const destroy of instances) destroy();
  };
}
