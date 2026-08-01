"use client";

import { durationMs } from "@repo/theme";
import { toCanvas } from "html-to-image";
import { useEffect, useRef, useState } from "react";
import { vaporizeVariants } from "./Vaporize.styles";
import type { VaporizeProps } from "./Vaporize.types";
import {
  calculateVaporizeSpread,
  createParticlesFromImageData,
  getCanvas2dContext,
  renderParticlesToImageData,
  resolveSampleRate,
  transformValue,
  updateParticles,
  VAPORIZE_MAX_DELTA,
  type VaporizeParticle,
  type VaporizeTextBoundaries,
} from "./vaporize.engine";

type Phase = "idle" | "capturing" | "playing" | "collapsing";

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Vaporize({
  children,
  active = false,
  onComplete,
  direction = "left-to-right",
  density = 5,
  spread = 5,
  duration = 1.05,
  collapseDurationMs = durationMs.moderate,
  className,
}: VaporizeProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const slots = vaporizeVariants({ phase });

  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<VaporizeParticle[]>([]);
  const boundariesRef = useRef<VaporizeTextBoundaries | null>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const progressRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const startedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseDurationRef = useRef(collapseDurationMs);
  const dprRef = useRef(1);
  const directionRef = useRef(direction);
  const spreadRef = useRef(spread);
  const densityRef = useRef(transformValue(density, [0, 10], [0.35, 1], true));
  const durationRef = useRef(duration * 1000);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    collapseDurationRef.current = collapseDurationMs;
    directionRef.current = direction;
    spreadRef.current = spread;
    densityRef.current = transformValue(density, [0, 10], [0.35, 1], true);
    durationRef.current = duration * 1000;
  }, [collapseDurationMs, density, direction, duration, spread]);

  const clearFrame = () => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const resetLayout = () => {
    const root = rootRef.current;
    if (!root) return;
    root.style.height = "";
    root.style.marginTop = "";
    root.style.marginBottom = "";
  };

  const finish = () => {
    completedRef.current = true;
    startedRef.current = false;
    particlesRef.current = [];
    imageDataRef.current = null;
    clearFrame();
    onCompleteRef.current?.();
  };

  const beginCollapse = () => {
    clearFrame();
    const root = rootRef.current;
    if (!root) {
      finish();
      return;
    }

    const height = root.getBoundingClientRect().height;
    root.style.height = `${height}px`;
    void root.offsetHeight;
    setPhase("collapsing");

    requestAnimationFrame(() => {
      const node = rootRef.current;
      if (!node) return;
      node.style.height = "0px";
      node.style.marginTop = "0px";
      node.style.marginBottom = "0px";
    });

    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = setTimeout(() => {
      finish();
    }, collapseDurationRef.current + 20);
  };

  useEffect(() => {
    if (!active) {
      completedRef.current = false;
      startedRef.current = false;
      setPhase("idle");
      particlesRef.current = [];
      imageDataRef.current = null;
      clearFrame();
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
        collapseTimerRef.current = null;
      }
      resetLayout();
      return;
    }

    if (startedRef.current || completedRef.current) return;
    startedRef.current = true;

    if (prefersReducedMotion()) {
      finish();
      return;
    }

    let cancelled = false;
    setPhase("capturing");

    const start = async () => {
      const content = contentRef.current;
      const canvas = canvasRef.current;
      if (!content || !canvas) return;

      const rect = content.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) {
        finish();
        return;
      }

      const dpr =
        typeof window !== "undefined"
          ? Math.min(window.devicePixelRatio || 1, 1.5)
          : 1;
      dprRef.current = dpr;

      try {
        const snapshot = await toCanvas(content, {
          pixelRatio: dpr,
          cacheBust: false,
          skipFonts: true,
          filter: (node) => {
            if (!(node instanceof HTMLElement)) return true;
            return !node.dataset.vaporizeIgnore;
          },
        });

        if (cancelled) return;

        const pad = 36;
        const width = rect.width;
        const height = rect.height;
        const canvasWidth = width + pad * 2;
        const canvasHeight = height + pad * 2;
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
        canvas.width = Math.floor(canvasWidth * dpr);
        canvas.height = Math.floor(canvasHeight * dpr);

        const ctx = getCanvas2dContext(canvas);
        if (!ctx) {
          finish();
          return;
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          snapshot,
          pad * dpr,
          pad * dpr,
          width * dpr,
          height * dpr,
        );

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        imageDataRef.current = imageData;

        const sampleRate = resolveSampleRate(canvas.width, canvas.height, dpr);
        particlesRef.current = createParticlesFromImageData(
          imageData,
          sampleRate,
        );

        const contentLeft = pad * dpr;
        const contentWidth = width * dpr;
        boundariesRef.current = {
          left: contentLeft,
          right: contentLeft + contentWidth,
          width: contentWidth,
        };
        progressRef.current = 0;
        completedRef.current = false;
        setPhase("playing");
      } catch {
        if (!cancelled) finish();
      }
    };

    void start();

    return () => {
      cancelled = true;
    };
  }, [active]);

  useEffect(() => {
    if (phase !== "playing") return;

    const canvas = canvasRef.current;
    const ctx = canvas ? getCanvas2dContext(canvas) : null;
    const buffer = imageDataRef.current;
    if (!canvas || !ctx || !buffer) return;

    const dpr = dprRef.current;
    const multipliedSpread =
      calculateVaporizeSpread(Math.min(canvas.height / dpr, 72)) *
      spreadRef.current;

    let lastTime = performance.now();
    let settledFrames = 0;

    const animate = (currentTime: number) => {
      const deltaTime = Math.min(
        (currentTime - lastTime) / 1000,
        VAPORIZE_MAX_DELTA,
      );
      lastTime = currentTime;

      const vaporizeDurationMs = durationRef.current;
      progressRef.current +=
        (deltaTime * 100) / Math.max(vaporizeDurationMs / 1000, 0.01);

      const boundaries = boundariesRef.current;
      if (!boundaries) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(100, progressRef.current);
      const vaporizeX =
        directionRef.current === "left-to-right"
          ? boundaries.left + (boundaries.width * progress) / 100
          : boundaries.right - (boundaries.width * progress) / 100;

      const allVaporized = updateParticles(
        particlesRef.current,
        vaporizeX,
        deltaTime,
        multipliedSpread,
        vaporizeDurationMs,
        directionRef.current,
        densityRef.current,
      );

      renderParticlesToImageData(buffer, particlesRef.current);
      ctx.putImageData(buffer, 0, 0);

      if (progress >= 100 && allVaporized) {
        settledFrames += 1;
        if (settledFrames >= 2) {
          beginCollapse();
          return;
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      clearFrame();
    };
  }, [phase]);

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      clearFrame();
    };
  }, []);

  const showCanvas = phase === "playing";
  const hideContent = phase === "playing" || phase === "collapsing";

  return (
    <div
      className={slots.root({ className })}
      ref={rootRef}
      style={
        phase === "collapsing"
          ? { transitionDuration: `${collapseDurationMs}ms` }
          : undefined
      }
    >
      <div
        aria-hidden={hideContent || undefined}
        className={slots.content()}
        ref={contentRef}
        style={hideContent ? { visibility: "hidden" } : undefined}
      >
        {children}
      </div>
      <canvas
        aria-hidden
        className={slots.canvas()}
        ref={canvasRef}
        style={{ display: showCanvas ? "block" : "none" }}
      />
    </div>
  );
}
