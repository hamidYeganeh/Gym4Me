export type VaporizeDirection = "left-to-right" | "right-to-left";

/** Soft cap keeps mobile frames smooth for card-sized captures. */
export const VAPORIZE_MAX_PARTICLES = 2800;
export const VAPORIZE_MAX_DELTA = 1 / 30;

export type VaporizeParticle = {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  r: number;
  g: number;
  b: number;
  opacity: number;
  originalAlpha: number;
  velocityX: number;
  velocityY: number;
  /** 0 = not yet vaporized; >0 = active. */
  speed: number;
  fadeQuick: 0 | 1;
  alive: 0 | 1;
};

export type VaporizeTextBoundaries = {
  left: number;
  right: number;
  width: number;
};

export function transformValue(
  input: number,
  inputRange: [number, number],
  outputRange: [number, number],
  clamp = false,
): number {
  const [inputMin, inputMax] = inputRange;
  const [outputMin, outputMax] = outputRange;
  const progress = (input - inputMin) / (inputMax - inputMin);
  let result = outputMin + progress * (outputMax - outputMin);

  if (clamp) {
    if (outputMax > outputMin) {
      result = Math.min(Math.max(result, outputMin), outputMax);
    } else {
      result = Math.min(Math.max(result, outputMax), outputMin);
    }
  }

  return result;
}

export function calculateVaporizeSpread(fontSize: number) {
  if (fontSize <= 20) return 0.2;
  if (fontSize >= 100) return 1.5;

  if (fontSize < 50) {
    return 0.2 + ((fontSize - 20) * (0.5 - 0.2)) / (50 - 20);
  }

  return 0.5 + ((fontSize - 50) * (1.5 - 0.5)) / (100 - 50);
}

export function parseColor(color: string) {
  const rgbaMatch = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/,
  );
  if (rgbaMatch) {
    const [, r, g, b, a = "1"] = rgbaMatch;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => char + char)
            .join("")
        : hex;
    if (normalized.length === 6) {
      const r = Number.parseInt(normalized.slice(0, 2), 16);
      const g = Number.parseInt(normalized.slice(2, 4), 16);
      const b = Number.parseInt(normalized.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, 1)`;
    }
  }

  return "rgba(0, 0, 0, 1)";
}

export function parseColorChannels(color: string) {
  const parsed = parseColor(color);
  const match = parsed.match(
    /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/,
  );
  if (!match) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: Number(match[4]),
  };
}

/** Pick a sample stride that stays under the particle budget. */
export function resolveSampleRate(
  width: number,
  height: number,
  dpr: number,
  maxParticles = VAPORIZE_MAX_PARTICLES,
) {
  const area = Math.max(1, width * height);
  // Rough opaque coverage for UI cards (~55%) / text (~12%).
  const estimatedOpaque = area * 0.45;
  const minRate = Math.max(1, Math.ceil(Math.sqrt(estimatedOpaque / maxParticles)));
  return Math.max(minRate, Math.round(dpr));
}

export function createParticlesFromImageData(
  imageData: ImageData,
  sampleRate: number,
  maxParticles = VAPORIZE_MAX_PARTICLES,
): VaporizeParticle[] {
  const { data, width, height } = imageData;
  const rate = Math.max(1, sampleRate);
  const particles: VaporizeParticle[] = [];
  const alphaBoost = Math.min(1.35, rate * 0.55);

  for (let y = 0; y < height; y += rate) {
    for (let x = 0; x < width; x += rate) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3] ?? 0;
      if (alpha < 18) continue;

      const originalAlpha = Math.min(1, (alpha / 255) * alphaBoost);
      particles.push({
        x,
        y,
        originalX: x,
        originalY: y,
        r: data[index] ?? 0,
        g: data[index + 1] ?? 0,
        b: data[index + 2] ?? 0,
        opacity: originalAlpha,
        originalAlpha,
        velocityX: 0,
        velocityY: 0,
        speed: 0,
        fadeQuick: 0,
        alive: 1,
      });

      if (particles.length >= maxParticles) {
        return particles;
      }
    }
  }

  return particles;
}

export function createParticlesFromText(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
  textX: number,
  textY: number,
  font: string,
  color: string,
  alignment: CanvasTextAlign,
): { particles: VaporizeParticle[]; textBoundaries: VaporizeTextBoundaries } {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = alignment;
  ctx.textBaseline = "middle";
  ctx.imageSmoothingEnabled = false;

  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  let textLeft = textX;
  if (alignment === "center") textLeft = textX - textWidth / 2;
  if (alignment === "right" || alignment === "end") textLeft = textX - textWidth;

  const textBoundaries = {
    left: textLeft,
    right: textLeft + textWidth,
    width: textWidth,
  };

  ctx.fillText(text, textX, textY);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const cssWidth = Number.parseFloat(canvas.style.width) || canvas.width;
  const currentDPR = canvas.width / Math.max(1, cssWidth);
  const sampleRate = resolveSampleRate(
    canvas.width,
    canvas.height,
    currentDPR,
    2200,
  );
  const particles = createParticlesFromImageData(imageData, sampleRate, 2200);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return { particles, textBoundaries };
}

export function updateParticles(
  particles: VaporizeParticle[],
  vaporizeX: number,
  deltaTime: number,
  multipliedSpread: number,
  vaporizeDurationMs: number,
  direction: VaporizeDirection,
  density: number,
) {
  const dt = Math.min(deltaTime, VAPORIZE_MAX_DELTA);
  const isLtr = direction === "left-to-right";
  const fadeRate = 0.32 * (1800 / Math.max(vaporizeDurationMs, 1));
  const quickFade = 1.8;
  const spreadScale = multipliedSpread * 2.2;
  const maxVelocity = multipliedSpread * 2.4;
  const maxVelocitySq = maxVelocity * maxVelocity;
  const dampingDenom = 100 * multipliedSpread || 1;
  let allParticlesVaporized = true;

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    if (!particle || particle.alive === 0) continue;

    const shouldVaporize = isLtr
      ? particle.originalX <= vaporizeX
      : particle.originalX >= vaporizeX;

    if (!shouldVaporize) {
      allParticlesVaporized = false;
      continue;
    }

    if (particle.speed === 0) {
      const angle = Math.random() * Math.PI * 2;
      particle.speed = (0.55 + Math.random() * 0.9) * multipliedSpread;
      particle.velocityX = Math.cos(angle) * particle.speed;
      particle.velocityY = Math.sin(angle) * particle.speed * 0.75;
      particle.fadeQuick = Math.random() > density ? 1 : 0;
    }

    if (particle.fadeQuick === 1) {
      particle.opacity -= dt * quickFade;
    } else {
      const dx = particle.originalX - particle.x;
      const dy = particle.originalY - particle.y;
      const distSq = dx * dx + dy * dy;
      const dampingFactor = Math.max(0.94, 1 - Math.sqrt(distSq) / dampingDenom);

      // Sparse jitter (every ~4th particle) keeps motion organic without RNG spam.
      if ((i & 3) === 0) {
        particle.velocityX += (Math.random() - 0.5) * spreadScale;
        particle.velocityY += (Math.random() - 0.5) * spreadScale * 0.7;
      }

      particle.velocityX = (particle.velocityX + dx * 0.0015) * dampingFactor;
      particle.velocityY = (particle.velocityY + dy * 0.0015) * dampingFactor;

      const velocitySq =
        particle.velocityX * particle.velocityX +
        particle.velocityY * particle.velocityY;
      if (velocitySq > maxVelocitySq) {
        const scale = maxVelocity / Math.sqrt(velocitySq);
        particle.velocityX *= scale;
        particle.velocityY *= scale;
      }

      particle.x += particle.velocityX * dt * 22;
      particle.y += particle.velocityY * dt * 12;
      particle.opacity -= dt * fadeRate;
    }

    if (particle.opacity <= 0.02) {
      particle.opacity = 0;
      particle.alive = 0;
      continue;
    }

    allParticlesVaporized = false;
  }

  return allParticlesVaporized;
}

/**
 * Fast path: write particles into a reusable ImageData buffer.
 * Avoids per-particle `fillStyle` string churn.
 */
export function renderParticlesToImageData(
  imageData: ImageData,
  particles: VaporizeParticle[],
) {
  const { data, width, height } = imageData;
  data.fill(0);

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    if (!particle || particle.alive === 0 || particle.opacity <= 0) continue;

    const x = particle.x | 0;
    const y = particle.y | 0;
    if (x < 0 || y < 0 || x >= width || y >= height) continue;

    const index = (y * width + x) * 4;
    const alpha = (particle.opacity * 255) | 0;
    // Additive-ish blend for overlapping samples (looks denser with fewer particles).
    data[index] = particle.r;
    data[index + 1] = particle.g;
    data[index + 2] = particle.b;
    data[index + 3] = data[index + 3]! > alpha ? data[index + 3]! : alpha;
  }
}

/** Legacy fillRect renderer (text cycle fade-in still uses channel colors). */
export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: VaporizeParticle[],
  globalDpr: number,
) {
  const inv = 1 / globalDpr;
  ctx.save();
  ctx.scale(globalDpr, globalDpr);

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    if (!particle || particle.alive === 0 || particle.opacity <= 0) continue;
    ctx.fillStyle = `rgba(${particle.r},${particle.g},${particle.b},${particle.opacity})`;
    ctx.fillRect(particle.x * inv, particle.y * inv, 1, 1);
  }

  ctx.restore();
}

export function resetParticles(particles: VaporizeParticle[]) {
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    if (!particle) continue;
    particle.x = particle.originalX;
    particle.y = particle.originalY;
    particle.opacity = particle.originalAlpha;
    particle.speed = 0;
    particle.velocityX = 0;
    particle.velocityY = 0;
    particle.fadeQuick = 0;
    particle.alive = 1;
  }
}

export function getCanvas2dContext(canvas: HTMLCanvasElement) {
  return canvas.getContext("2d", {
    alpha: true,
    desynchronized: true,
    willReadFrequently: false,
  });
}
