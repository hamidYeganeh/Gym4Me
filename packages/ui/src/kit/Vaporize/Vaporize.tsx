"use client";

import { durationMs } from "@repo/theme";
import { toCanvas } from "html-to-image";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { vaporizeVariants } from "./Vaporize.styles";
import type { VaporizeProps } from "./Vaporize.types";
import {
  calculateVaporizeSpread,
  createParticlesFromImageData,
  createParticlesFromText,
  getCanvas2dContext,
  parseColorChannels,
  renderParticlesToImageData,
  resolveSampleRate,
  transformValue,
  updateParticles,
  VAPORIZE_MAX_DELTA,
  type VaporizeDirection,
  type VaporizeParticle,
  type VaporizeTextBoundaries,
} from "./vaporize.engine";

type Phase = "idle" | "capturing" | "playing" | "done";

const PARTICLE_PAD_PX = 40;

function reducedMotionPreferred() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function resolveCssColor(element: HTMLElement, fallback: string) {
  const sample = getComputedStyle(element).color || fallback;
  const channels = parseColorChannels(sample);
  return `rgba(${channels.r}, ${channels.g}, ${channels.b}, ${channels.a})`;
}

async function captureDomSnapshot(
  source: HTMLElement,
  canvas: HTMLCanvasElement,
  dpr: number,
): Promise<{
  particles: VaporizeParticle[];
  boundaries: VaporizeTextBoundaries;
  buffer: ImageData;
} | null> {
  const rect = source.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;

  const snapshot = await toCanvas(source, {
    pixelRatio: dpr,
    cacheBust: false,
    skipFonts: true,
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return true;
      return node.dataset.vaporizeIgnore == null;
    },
  });

  const width = rect.width;
  const height = rect.height;
  const canvasWidth = width + PARTICLE_PAD_PX * 2;
  const canvasHeight = height + PARTICLE_PAD_PX * 2;

  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  canvas.width = Math.floor(canvasWidth * dpr);
  canvas.height = Math.floor(canvasHeight * dpr);

  const ctx = getCanvas2dContext(canvas);
  if (!ctx) return null;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    snapshot,
    PARTICLE_PAD_PX * dpr,
    PARTICLE_PAD_PX * dpr,
    width * dpr,
    height * dpr,
  );

  const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const sampleRate = resolveSampleRate(canvas.width, canvas.height, dpr);
  const particles = createParticlesFromImageData(buffer, sampleRate);
  const contentLeft = PARTICLE_PAD_PX * dpr;
  const contentWidth = width * dpr;

  return {
    particles,
    boundaries: {
      left: contentLeft,
      right: contentLeft + contentWidth,
      width: contentWidth,
    },
    buffer,
  };
}

function captureTextSnapshot(
  canvas: HTMLCanvasElement,
  texts: string[],
  source: HTMLElement,
  dpr: number,
  direction: VaporizeDirection,
): {
  particles: VaporizeParticle[];
  boundaries: VaporizeTextBoundaries;
  buffer: ImageData;
} | null {
  const label = texts.join(" ").trim();
  if (!label) return null;

  const styles = getComputedStyle(source);
  const fontSize = Number.parseFloat(styles.fontSize) || 16;
  const fontWeight = styles.fontWeight || "400";
  const fontFamily = styles.fontFamily || "sans-serif";
  const color = resolveCssColor(source, "rgb(0, 0, 0)");

  const width = Math.max(source.offsetWidth, fontSize * label.length * 0.55);
  const height = Math.max(source.offsetHeight, fontSize * 1.6);
  const canvasWidth = width + PARTICLE_PAD_PX * 2;
  const canvasHeight = height + PARTICLE_PAD_PX * 2;

  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  canvas.width = Math.floor(canvasWidth * dpr);
  canvas.height = Math.floor(canvasHeight * dpr);

  const ctx = getCanvas2dContext(canvas);
  if (!ctx) return null;

  const alignment =
    direction === "right-to-left"
      ? "right"
      : styles.direction === "rtl"
        ? "right"
        : "left";
  const textX =
    alignment === "right"
      ? canvas.width - PARTICLE_PAD_PX * dpr
      : PARTICLE_PAD_PX * dpr;

  const { particles, textBoundaries } = createParticlesFromText(
    ctx,
    canvas,
    label,
    textX,
    canvas.height / 2,
    `${fontWeight} ${fontSize * dpr}px ${fontFamily}`,
    color,
    alignment,
  );

  return {
    particles,
    boundaries: textBoundaries,
    buffer: ctx.createImageData(canvas.width, canvas.height),
  };
}

export function Vaporize({
  children,
  texts,
  active = false,
  onComplete,
  direction = "left-to-right",
  density = 5,
  spread = 5,
  duration = 1.1,
  className,
}: VaporizeProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const slots = vaporizeVariants({ phase });

  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<VaporizeParticle[]>([]);
  const boundariesRef = useRef<VaporizeTextBoundaries | null>(null);
  const bufferRef = useRef<ImageData | null>(null);
  const progressRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const runIdRef = useRef(0);
  const busyRef = useRef(false);

  const optionsRef = useRef({
    direction,
    density: transformValue(density, [0, 10], [0.35, 1], true),
    spread,
    durationMs: duration * 1000,
  });
  optionsRef.current = {
    direction,
    density: transformValue(density, [0, 10], [0.35, 1], true),
    spread,
    durationMs: duration * 1000,
  };

  const notifyComplete = useEffectEvent(() => {
    onComplete?.();
  });

  const stopFrame = () => {
    if (frameRef.current == null) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  };

  useEffect(() => {
    if (!active) {
      runIdRef.current += 1;
      stopFrame();
      busyRef.current = false;
      particlesRef.current = [];
      boundariesRef.current = null;
      bufferRef.current = null;
      progressRef.current = 0;
      setPhase("idle");
      return;
    }

    if (busyRef.current) return;
    busyRef.current = true;

    if (reducedMotionPreferred()) {
      setPhase("done");
      return;
    }

    const runId = ++runIdRef.current;
    let cancelled = false;
    setPhase("capturing");

    const boot = async () => {
      const content = contentRef.current;
      const canvas = canvasRef.current;
      if (!content || !canvas) {
        busyRef.current = false;
        setPhase("done");
        return;
      }

      const dpr =
        typeof window !== "undefined"
          ? Math.min(window.devicePixelRatio || 1, 1.5)
          : 1;

      try {
        const textList = texts;
        const useTextPath =
          children == null && textList != null && textList.length > 0;
        const snapshot = useTextPath
          ? captureTextSnapshot(
              canvas,
              textList,
              content,
              dpr,
              optionsRef.current.direction,
            )
          : await captureDomSnapshot(content, canvas, dpr);

        if (cancelled || runId !== runIdRef.current) return;
        if (!snapshot || snapshot.particles.length === 0) {
          busyRef.current = false;
          setPhase("done");
          return;
        }

        particlesRef.current = snapshot.particles;
        boundariesRef.current = snapshot.boundaries;
        bufferRef.current = snapshot.buffer;
        progressRef.current = 0;
        setPhase("playing");
      } catch {
        if (!cancelled && runId === runIdRef.current) {
          busyRef.current = false;
          setPhase("done");
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
    // Capture once when `active` turns true; read children/texts from that render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot trigger
  }, [active]);

  useEffect(() => {
    if (phase !== "playing") return;

    const canvas = canvasRef.current;
    const ctx = canvas ? getCanvas2dContext(canvas) : null;
    const buffer = bufferRef.current;
    if (!canvas || !ctx || !buffer) return;

    const dpr =
      typeof window !== "undefined"
        ? Math.min(window.devicePixelRatio || 1, 1.5)
        : 1;
    const multipliedSpread =
      calculateVaporizeSpread(Math.min(canvas.height / dpr, 80)) *
      optionsRef.current.spread;

    let lastTime = performance.now();
    let settled = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, VAPORIZE_MAX_DELTA);
      lastTime = now;

      const { direction: dir, density: dens, durationMs: vaporMs } =
        optionsRef.current;
      progressRef.current += (dt * 100) / Math.max(vaporMs / 1000, 0.01);

      const bounds = boundariesRef.current;
      if (!bounds) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min(100, progressRef.current);
      const vaporizeX =
        dir === "left-to-right"
          ? bounds.left + (bounds.width * progress) / 100
          : bounds.right - (bounds.width * progress) / 100;

      const finished = updateParticles(
        particlesRef.current,
        vaporizeX,
        dt,
        multipliedSpread,
        vaporMs,
        dir,
        dens,
      );

      renderParticlesToImageData(buffer, particlesRef.current);
      ctx.putImageData(buffer, 0, 0);

      if (progress >= 100 && finished) {
        settled += 1;
        if (settled >= 2) {
          stopFrame();
          busyRef.current = false;
          setPhase("done");
          return;
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => stopFrame();
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;

    const timer = window.setTimeout(() => {
      stopFrame();
      busyRef.current = false;
      particlesRef.current = [];
      boundariesRef.current = null;
      bufferRef.current = null;
      progressRef.current = 0;
      notifyComplete();
    }, durationMs.moderate);

    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- notifyComplete is useEffectEvent
  }, [phase]);

  useEffect(() => () => stopFrame(), []);

  return (
    <div className={slots.root({ className })}>
      <div className={slots.shell()}>
        <div className={slots.shellInner()}>
          <div className={slots.content()} ref={contentRef}>
            {children ?? (texts != null ? texts.join(" ") : null)}
          </div>
        </div>
      </div>
      <canvas
        aria-hidden
        className={slots.canvas()}
        ref={canvasRef}
        style={{ display: phase === "playing" ? "block" : "none" }}
      />
    </div>
  );
}
