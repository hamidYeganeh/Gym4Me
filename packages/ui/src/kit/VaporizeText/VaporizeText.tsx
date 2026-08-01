"use client";

import {
  createElement,
  memo,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  calculateVaporizeSpread,
  createParticlesFromText,
  getCanvas2dContext,
  parseColorChannels,
  renderParticlesToImageData,
  resetParticles,
  transformValue,
  updateParticles,
  VAPORIZE_MAX_DELTA,
  type VaporizeParticle,
  type VaporizeTextBoundaries,
} from "../Vaporize/vaporize.engine";
import { vaporizeTextVariants } from "./VaporizeText.styles";
import { VaporizeTextTag, type VaporizeTextProps } from "./VaporizeText.types";

type AnimationState = "static" | "vaporizing" | "fadingIn" | "waiting";

function useIsInView(ref: RefObject<HTMLElement | null>) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0, rootMargin: "50px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return isInView;
}

const SeoElement = memo(function SeoElement({
  tag = VaporizeTextTag.P,
  texts,
  className,
}: {
  tag: VaporizeTextTag;
  texts: string[];
  className?: string;
}) {
  const safeTag = Object.values(VaporizeTextTag).includes(tag) ? tag : "p";
  return createElement(safeTag, { className }, texts.join(" "));
});

export function VaporizeText({
  texts = ["Next.js", "React"],
  font = {
    fontFamily: "sans-serif",
    fontSize: "50px",
    fontWeight: 400,
  },
  color = "rgb(255, 255, 255)",
  spread = 5,
  density = 5,
  animation = {
    vaporizeDuration: 2,
    fadeInDuration: 1,
    waitDuration: 0.5,
  },
  direction = "left-to-right",
  alignment = "center",
  tag = VaporizeTextTag.P,
  className,
}: VaporizeTextProps) {
  const slots = vaporizeTextVariants();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isInView = useIsInView(wrapperRef);

  const particlesRef = useRef<VaporizeParticle[]>([]);
  const boundariesRef = useRef<VaporizeTextBoundaries | null>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const animationStateRef = useRef<AnimationState>("static");
  const vaporizeProgressRef = useRef(0);
  const fadeOpacityRef = useRef(0);
  const currentTextIndexRef = useRef(0);
  const waitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);
  const dprRef = useRef(1);
  const sizeRef = useRef({ width: 0, height: 0 });

  const configRef = useRef({
    texts,
    font,
    color,
    spread,
    direction,
    alignment,
    transformedDensity: transformValue(density, [0, 10], [0.3, 1], true),
    vaporizeMs: (animation.vaporizeDuration ?? 2) * 1000,
    fadeInMs: (animation.fadeInDuration ?? 1) * 1000,
    waitMs: (animation.waitDuration ?? 0.5) * 1000,
  });

  configRef.current = {
    texts,
    font,
    color,
    spread,
    direction,
    alignment,
    transformedDensity: transformValue(density, [0, 10], [0.3, 1], true),
    vaporizeMs: (animation.vaporizeDuration ?? 2) * 1000,
    fadeInMs: (animation.fadeInDuration ?? 1) * 1000,
    waitMs: (animation.waitDuration ?? 0.5) * 1000,
  };

  const rebuildParticles = () => {
    const canvas = canvasRef.current;
    const { width, height } = sizeRef.current;
    if (!canvas || width < 1 || height < 1) return;

    const cfg = configRef.current;
    const dpr =
      typeof window !== "undefined"
        ? Math.min((window.devicePixelRatio || 1) * 1.25, 2)
        : 1;
    dprRef.current = dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    const ctx = getCanvas2dContext(canvas);
    if (!ctx) return;

    const fontSize = Number.parseInt(
      cfg.font.fontSize?.replace("px", "") || "50",
      10,
    );
    const fontFace = `${cfg.font.fontWeight ?? 400} ${fontSize * dpr}px ${cfg.font.fontFamily ?? "sans-serif"}`;
    const channels = parseColorChannels(cfg.color);
    const fill = `rgba(${channels.r}, ${channels.g}, ${channels.b}, ${channels.a})`;

    let textX = canvas.width;
    if (cfg.alignment === "center") textX = canvas.width / 2;
    if (cfg.alignment === "left") textX = 0;

    const currentText =
      cfg.texts[currentTextIndexRef.current] ?? cfg.texts[0] ?? "";
    const { particles, textBoundaries } = createParticlesFromText(
      ctx,
      canvas,
      currentText,
      textX,
      canvas.height / 2,
      fontFace,
      fill,
      cfg.alignment,
    );

    particlesRef.current = particles;
    boundariesRef.current = textBoundaries;
    imageDataRef.current = ctx.createImageData(canvas.width, canvas.height);

    // Paint static frame immediately.
    renderParticlesToImageData(imageDataRef.current, particles);
    ctx.putImageData(imageDataRef.current, 0, 0);
  };

  useEffect(() => {
    animationStateRef.current = isInView ? "vaporizing" : "static";
    if (!isInView) {
      vaporizeProgressRef.current = 0;
      if (waitTimeoutRef.current) {
        clearTimeout(waitTimeoutRef.current);
        waitTimeoutRef.current = null;
      }
    }
  }, [isInView]);

  useEffect(() => {
    const container = wrapperRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      sizeRef.current = { width, height };
      rebuildParticles();
    });

    resizeObserver.observe(container);
    const rect = container.getBoundingClientRect();
    sizeRef.current = { width: rect.width, height: rect.height };
    rebuildParticles();

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    rebuildParticles();
  }, [texts, font, color, alignment, spread]);

  useEffect(() => {
    if (!isInView) {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas ? getCanvas2dContext(canvas) : null;
    if (!canvas || !ctx) return;

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      const deltaTime = Math.min(rawDt, VAPORIZE_MAX_DELTA);
      lastTime = currentTime;

      const buffer = imageDataRef.current;
      const cfg = configRef.current;
      if (!buffer || particlesRef.current.length === 0) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      const fontSize = Number.parseInt(
        cfg.font.fontSize?.replace("px", "") || "50",
        10,
      );
      const multipliedSpread = calculateVaporizeSpread(fontSize) * cfg.spread;
      const state = animationStateRef.current;

      switch (state) {
        case "static":
        case "waiting": {
          renderParticlesToImageData(buffer, particlesRef.current);
          ctx.putImageData(buffer, 0, 0);
          break;
        }
        case "vaporizing": {
          vaporizeProgressRef.current +=
            (deltaTime * 100) / Math.max(cfg.vaporizeMs / 1000, 0.01);

          const textBoundaries = boundariesRef.current;
          if (!textBoundaries) break;

          const progress = Math.min(100, vaporizeProgressRef.current);
          const vaporizeX =
            cfg.direction === "left-to-right"
              ? textBoundaries.left + (textBoundaries.width * progress) / 100
              : textBoundaries.right - (textBoundaries.width * progress) / 100;

          const allVaporized = updateParticles(
            particlesRef.current,
            vaporizeX,
            deltaTime,
            multipliedSpread,
            cfg.vaporizeMs,
            cfg.direction,
            cfg.transformedDensity,
          );
          renderParticlesToImageData(buffer, particlesRef.current);
          ctx.putImageData(buffer, 0, 0);

          if (vaporizeProgressRef.current >= 100 && allVaporized) {
            currentTextIndexRef.current =
              (currentTextIndexRef.current + 1) % cfg.texts.length;
            rebuildParticles();
            fadeOpacityRef.current = 0;
            // Start invisible for fade-in.
            for (const particle of particlesRef.current) {
              particle.opacity = 0;
            }
            animationStateRef.current = "fadingIn";
          }
          break;
        }
        case "fadingIn": {
          fadeOpacityRef.current += deltaTime * (1000 / Math.max(cfg.fadeInMs, 1));
          const t = Math.min(fadeOpacityRef.current, 1);

          for (const particle of particlesRef.current) {
            particle.x = particle.originalX;
            particle.y = particle.originalY;
            particle.opacity = t * particle.originalAlpha;
            particle.alive = 1;
          }

          renderParticlesToImageData(buffer, particlesRef.current);
          ctx.putImageData(buffer, 0, 0);

          if (t >= 1) {
            animationStateRef.current = "waiting";
            if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
            waitTimeoutRef.current = setTimeout(() => {
              animationStateRef.current = "vaporizing";
              vaporizeProgressRef.current = 0;
              resetParticles(particlesRef.current);
            }, cfg.waitMs);
          }
          break;
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (waitTimeoutRef.current) {
        clearTimeout(waitTimeoutRef.current);
        waitTimeoutRef.current = null;
      }
    };
  }, [isInView]);

  return (
    <div className={slots.root({ className })} ref={wrapperRef}>
      <canvas className={slots.canvas()} ref={canvasRef} />
      <SeoElement className={slots.seo()} tag={tag} texts={texts} />
    </div>
  );
}
