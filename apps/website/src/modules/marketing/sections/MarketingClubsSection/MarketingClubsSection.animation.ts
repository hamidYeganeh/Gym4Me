import { useSyncExternalStore } from "react";

export const CARD_WIDTH = 80;
export const CARD_HEIGHT = 105;
export const DESKTOP_CARD_COUNT = 20;
export const MOBILE_CARD_COUNT = 8;
export const PIN_DISTANCE = 4200;
const MOBILE_MQ = "(max-width: 767px)";

function subscribeMobile(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_MQ).matches,
    () => false,
  );
}

export const lerp = (start: number, end: number, t: number) =>
  start * (1 - t) + end * t;

export const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

export type Pose = {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
};

export function getStageValues(progress: number) {
  return {
    lineT: clamp01(progress / 0.12),
    circleT: clamp01((progress - 0.12) / 0.16),
    morph: clamp01((progress - 0.28) / 0.2),
    rotate: clamp01((progress - 0.48) / 0.52),
  };
}

export function poseForIndex(
  index: number,
  progress: number,
  size: { width: number; height: number },
  scatter: Pose,
  parallax: number,
  totalCards: number,
): Pose {
  const { lineT, circleT, morph, rotate } = getStageValues(progress);
  const cardCount = Math.max(totalCards, 1);

  const lineSpacing = CARD_WIDTH + 12;
  const lineTotalWidth = cardCount * lineSpacing;
  const linePos: Pose = {
    x: index * lineSpacing - lineTotalWidth / 2,
    y: 0,
    rotation: 0,
    scale: 1,
    opacity: 1,
  };

  const isMobile = size.width < 768;
  const minDimension = Math.min(size.width, size.height);
  const circleRadius = Math.min(minDimension * 0.35, 350);
  const circleAngle = (index / cardCount) * 360;
  const circleRad = (circleAngle * Math.PI) / 180;
  const circlePos: Pose = {
    x: Math.cos(circleRad) * circleRadius,
    y: Math.sin(circleRad) * circleRadius,
    rotation: circleAngle + 90,
    scale: 1,
    opacity: 1,
  };

  if (progress < 0.12) {
    return {
      x: lerp(scatter.x, linePos.x, lineT),
      y: lerp(scatter.y, linePos.y, lineT),
      rotation: lerp(scatter.rotation, linePos.rotation, lineT),
      scale: lerp(scatter.scale, linePos.scale, lineT),
      opacity: lerp(scatter.opacity, linePos.opacity, lineT),
    };
  }

  if (progress < 0.28) {
    return {
      x: lerp(linePos.x, circlePos.x, circleT),
      y: lerp(linePos.y, circlePos.y, circleT),
      rotation: lerp(linePos.rotation, circlePos.rotation, circleT),
      scale: 1,
      opacity: 1,
    };
  }

  const baseRadius = Math.min(size.width, size.height * 1.5);
  const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
  const arcApexY = size.height * (isMobile ? 0.35 : 0.25);
  const arcCenterY = arcApexY + arcRadius;
  const spreadAngle = isMobile ? 100 : 130;
  const startAngle = -90 - spreadAngle / 2;
  const step = spreadAngle / Math.max(cardCount - 1, 1);
  const boundedRotation = -rotate * spreadAngle * 0.8;
  const currentArcAngle = startAngle + index * step + boundedRotation;
  const arcRad = (currentArcAngle * Math.PI) / 180;
  const arcScale = isMobile ? 1.35 : 1.65;

  return {
    x: lerp(circlePos.x, Math.cos(arcRad) * arcRadius + parallax, morph),
    y: lerp(circlePos.y, Math.sin(arcRad) * arcRadius + arcCenterY, morph),
    rotation: lerp(circlePos.rotation, currentArcAngle + 90, morph),
    scale: lerp(1, arcScale, morph),
    opacity: 1,
  };
}
