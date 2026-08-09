"use client";

import { Card } from "@heroui/react";
import { BarbellDiagonal } from "@repo/icons/BarbellDiagonal";
import { useId, type JSX } from "react";
// import { Logo } from "../../common/Logo";
import { achievementTagVariants } from "./AchievementTag.styles";
import {
  DiamondFrame,
  OctagonFrame,
  Star1Frame,
  Star2Frame,
} from "./AchievementTag.shapes";
import type {
  AchievementTagProps,
  AchievementTagVariant,
} from "./AchievementTag.types";

const POLYGON_OUTER =
  "M22.0342 1.78605C23.2718 1.07152 24.7966 1.07152 26.0342 1.78605L42.8188 11.4766C44.0564 12.1912 44.8188 13.5117 44.8188 14.9407V34.3219C44.8188 35.751 44.0564 37.0715 42.8188 37.786L26.0342 47.4766C24.7966 48.1912 23.2718 48.1912 22.0342 47.4766L5.24957 37.786C4.01197 37.0715 3.24957 35.751 3.24957 34.3219V14.9407C3.24957 13.5117 4.01197 12.1912 5.24957 11.4766L22.0342 1.78605Z";

const POLYGON_MID =
  "M23.1592 6.42529C23.7006 6.11269 24.3677 6.11269 24.9092 6.42529L39.3633 14.77C39.9046 15.0826 40.2381 15.6606 40.2383 16.2856V32.9771C40.2381 33.6021 39.9046 34.1801 39.3633 34.4927L24.9092 42.8374C24.3677 43.15 23.7006 43.15 23.1592 42.8374L8.70508 34.4927C8.16374 34.1801 7.83022 33.6021 7.83008 32.9771V16.2856C7.83022 15.6606 8.16374 15.0826 8.70508 14.77L23.1592 6.42529Z";

const POLYGON_INNER =
  "M23.6592 9.13623C23.8623 9.01902 24.1069 9.00425 24.3203 9.09229L24.4092 9.13623L37.2656 16.5591C37.4976 16.693 37.6406 16.9406 37.6406 17.2085V32.0542C37.6406 32.3221 37.4976 32.5697 37.2656 32.7036L24.4092 40.1265C24.1772 40.2603 23.8912 40.2603 23.6592 40.1265L10.8027 32.7036C10.5707 32.5697 10.4278 32.3221 10.4277 32.0542V17.2085C10.4278 16.9406 10.5707 16.693 10.8027 16.5591L23.6592 9.13623Z";

type ShineStripe = {
  x: number;
  y: number;
  width: number;
  gx: number;
  gy1: number;
  gy2: number;
};

const CIRCULAR_STRIPES: ShineStripe[] = [
  { x: 25.25, y: -21, width: 8, gx: 29.25, gy1: -21, gy2: 43 },
  {
    x: 33.7344,
    y: -12.5146,
    width: 3,
    gx: 35.2344,
    gy1: -12.5146,
    gy2: 51.4854,
  },
  {
    x: 38.6855,
    y: -7.56494,
    width: 1,
    gx: 39.1855,
    gy1: -7.56494,
    gy2: 56.4351,
  },
  {
    x: 41.5137,
    y: -4.73633,
    width: 18,
    gx: 50.5137,
    gy1: -4.73633,
    gy2: 59.2637,
  },
  {
    x: 61.3125,
    y: 15.0625,
    width: 10,
    gx: 66.3125,
    gy1: 15.0625,
    gy2: 79.0625,
  },
  {
    x: 57.0703,
    y: 10.8198,
    width: 2,
    gx: 58.0703,
    gy1: 10.8198,
    gy2: 74.8198,
  },
  {
    x: 69.0898,
    y: 22.8408,
    width: 2,
    gx: 70.0898,
    gy1: 22.8408,
    gy2: 86.8408,
  },
];

function DropShadowFilter({
  id,
  uid,
  x,
  y,
  width,
  height,
}: {
  id: string;
  uid: string;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const effect1 = `effect1_dropShadow_${uid}`;
  const effect2 = `effect2_dropShadow_${uid}`;

  return (
    <filter
      colorInterpolationFilters="sRGB"
      filterUnits="userSpaceOnUse"
      height={height}
      id={id}
      width={width}
      x={x}
      y={y}
    >
      <feFlood floodOpacity={0} result="BackgroundImageFix" />
      <feColorMatrix
        in="SourceAlpha"
        result="hardAlpha"
        type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
      />
      <feMorphology
        in="SourceAlpha"
        operator="erode"
        radius={1}
        result={effect1}
      />
      <feOffset dy={2} />
      <feGaussianBlur stdDeviation={2} />
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0"
      />
      <feBlend in2="BackgroundImageFix" mode="normal" result={effect1} />
      <feColorMatrix
        in="SourceAlpha"
        result="hardAlpha"
        type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
      />
      <feOffset dy={1} />
      <feGaussianBlur stdDeviation={1} />
      <feComposite in2="hardAlpha" operator="out" />
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"
      />
      <feBlend in2={effect1} mode="normal" result={effect2} />
      <feBlend in="SourceGraphic" in2={effect2} mode="normal" result="shape" />
    </filter>
  );
}

function ShineStops() {
  return (
    <>
      <stop stopColor="white" />
      <stop offset={0.533654} stopColor="white" stopOpacity={0.2} />
      <stop offset={1} stopColor="white" />
    </>
  );
}

function PolygonFrame({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const filter0 = `filter0_dd_${uid}`;
  const filter1 = `filter1_dd_${uid}`;
  const mask0 = `mask0_${uid}`;
  const paint0 = `paint0_linear_${uid}`;
  const paint1 = `paint1_linear_${uid}`;
  const paint2 = `paint2_linear_${uid}`;
  const paint3 = `paint3_linear_${uid}`;
  const paint4 = `paint4_linear_${uid}`;

  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 49 54"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filter0})`}>
        <path
          d={POLYGON_OUTER}
          fill="var(--tag-outer)"
          shapeRendering="crispEdges"
        />
        <path
          d={POLYGON_OUTER}
          shapeRendering="crispEdges"
          stroke={`url(#${paint0})`}
          strokeWidth={0.5}
        />
      </g>
      <g opacity={0.32}>
        <mask
          height={92}
          id={mask0}
          maskUnits="userSpaceOnUse"
          style={{ maskType: "luminance" }}
          width={92}
          x={-22}
          y={-21}
        >
          <rect
            fill="white"
            height={64}
            transform="rotate(45 24.0342 -20.3687)"
            width={8}
            x={24.0342}
            y={-20.3687}
          />
          <rect
            fill="white"
            height={64}
            transform="rotate(45 32.5195 -11.8833)"
            width={3}
            x={32.5195}
            y={-11.8833}
          />
          <rect
            fill="white"
            height={64}
            transform="rotate(45 37.4688 -6.93359)"
            width={1}
            x={37.4688}
            y={-6.93359}
          />
          <rect
            fill="white"
            height={64}
            transform="rotate(45 40.2979 -4.10498)"
            width={18}
            x={40.2979}
            y={-4.10498}
          />
          <rect
            fill="white"
            height={64}
            transform="rotate(45 60.0967 15.6938)"
            width={10}
            x={60.0967}
            y={15.6938}
          />
          <rect
            fill="white"
            height={64}
            transform="rotate(45 55.8535 11.4512)"
            width={2}
            x={55.8535}
            y={11.4512}
          />
          <rect
            fill="white"
            height={64}
            transform="rotate(45 67.875 23.4722)"
            width={2}
            x={67.875}
            y={23.4722}
          />
        </mask>
        <g mask={`url(#${mask0})`}>
          <g filter={`url(#${filter1})`}>
            <path
              d={POLYGON_OUTER}
              fill={`url(#${paint1})`}
              shapeRendering="crispEdges"
            />
          </g>
        </g>
      </g>
      <path
        d={POLYGON_MID}
        fill="var(--tag-inner)"
        stroke={`url(#${paint2})`}
        strokeWidth={0.5}
      />
      <path
        d={POLYGON_INNER}
        fill={`url(#${paint3})`}
        opacity={0.32}
        stroke={`url(#${paint4})`}
        strokeWidth={0.5}
      />
      <defs>
        <DropShadowFilter
          height={53.2627}
          id={filter0}
          uid={`${uid}_a`}
          width={48.0684}
          x={0}
          y={0}
        />
        <DropShadowFilter
          height={52.7627}
          id={filter1}
          uid={`${uid}_b`}
          width={47.5684}
          x={0.25}
          y={0.25}
        />
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint0}
          x1={24.0342}
          x2={24.0342}
          y1={0.631348}
          y2={48.6313}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint1}
          x1={24.0342}
          x2={24.0342}
          y1={0.631348}
          y2={48.6313}
        >
          <ShineStops />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint2}
          x1={24.0342}
          x2={24.0342}
          y1={5.63135}
          y2={43.6313}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint3}
          x1={24.0342}
          x2={24.0342}
          y1={8.63135}
          y2={40.6313}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint4}
          x1={24.0342}
          x2={24.0342}
          y1={8.63135}
          y2={40.6313}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

const WAVY_OUTER =
  "M20.682 3.60438C23.5158 0.57234 28.3241 0.57234 31.1579 3.60438C32.5713 5.11663 34.5693 5.94423 36.638 5.87432C40.7858 5.73415 44.1858 9.13414 44.0456 13.2819C43.9757 15.3507 44.8033 17.3487 46.3155 18.762C49.3476 21.5958 49.3476 26.4042 46.3155 29.238C44.8033 30.6513 43.9757 32.6493 44.0456 34.7181C44.1858 38.8659 40.7858 42.2659 36.638 42.1257C34.5693 42.0558 32.5713 42.8834 31.1579 44.3956C28.3241 47.4277 23.5158 47.4277 20.682 44.3956C19.2686 42.8834 17.2706 42.0558 15.2018 42.1257C11.0541 42.2659 7.65407 38.8659 7.79424 34.7181C7.86415 32.6493 7.03655 30.6513 5.5243 29.238C2.49226 26.4042 2.49226 21.5958 5.5243 18.762C7.03655 17.3487 7.86415 15.3507 7.79424 13.2819C7.65407 9.13414 11.0541 5.73415 15.2018 5.87432C17.2706 5.94423 19.2686 5.11663 20.682 3.60438Z";

const WAVY_MID =
  "M21.8721 7.69727C24.0621 5.35418 27.7778 5.35418 29.9678 7.69727C31.1586 8.97135 32.842 9.66916 34.585 9.61035C37.7905 9.50202 40.4179 12.1295 40.3096 15.335C40.2508 17.0779 40.9486 18.7614 42.2227 19.9521C44.5657 22.1422 44.5657 25.8578 42.2227 28.0479C40.9486 29.2386 40.2508 30.9221 40.3096 32.665C40.4179 35.8705 37.7905 38.498 34.585 38.3896C32.842 38.3308 31.1586 39.0286 29.9678 40.3027C27.7778 42.6458 24.0621 42.6458 21.8721 40.3027C20.6813 39.0286 18.9978 38.3308 17.2549 38.3896C14.0494 38.498 11.4219 35.8705 11.5303 32.665C11.5891 30.9221 10.8913 29.2386 9.61719 28.0479C7.27411 25.8578 7.27411 22.1422 9.61719 19.9521C10.8913 18.7614 11.5891 17.0779 11.5303 15.335C11.4219 12.1295 14.0494 9.50202 17.2549 9.61035C18.9978 9.66916 20.6813 8.97135 21.8721 7.69727Z";

const WAVY_INNER =
  "M22.6777 10.835C24.4318 8.9583 27.4081 8.9583 29.1621 10.835C30.1355 11.8765 31.5118 12.4466 32.9365 12.3984C35.5038 12.3118 37.6081 14.4162 37.5215 16.9834C37.4733 18.4082 38.0434 19.7844 39.085 20.7578C40.9616 22.5119 40.9616 25.4881 39.085 27.2422C38.0434 28.2156 37.4733 29.5918 37.5215 31.0166C37.6081 33.5838 35.5038 35.6882 32.9365 35.6016C31.5118 35.5534 30.1355 36.1235 29.1621 37.165C27.4081 39.0417 24.4318 39.0417 22.6777 37.165C21.7043 36.1235 20.3281 35.5534 18.9033 35.6016C16.3361 35.6882 14.2317 33.5838 14.3184 31.0166C14.3665 29.5918 13.7964 28.2156 12.7549 27.2422C10.8782 25.4881 10.8782 22.5119 12.7549 20.7578C13.7964 19.7844 14.3665 18.4082 14.3184 16.9834C14.2317 14.4162 16.3361 12.3118 18.9033 12.3984C20.3281 12.4466 21.7043 11.8765 22.6777 10.835Z";

const WAVY_MASK_STRIPES = [
  { x: -19.0801, y: 24, width: 8 },
  { x: -10.5947, y: 15.5146, width: 3 },
  { x: -5.64551, y: 10.5649, width: 1 },
  { x: -2.81641, y: 7.73633, width: 18 },
  { x: 16.9824, y: -12.0625, width: 10 },
  { x: 12.7393, y: -7.81982, width: 2 },
  { x: 24.7607, y: -19.8408, width: 2 },
] as const;

function CircularFrame({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const filter0 = `filter0_dd_${uid}`;
  const clip0 = `clip0_${uid}`;
  const paintStripe = CIRCULAR_STRIPES.map(
    (_, index) => `paint${index}_linear_${uid}`,
  );
  const paint7 = `paint7_linear_${uid}`;
  const paint8 = `paint8_linear_${uid}`;
  const paint9 = `paint9_linear_${uid}`;
  const paint10 = `paint10_linear_${uid}`;

  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 51 52"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filter0})`}>
        <g clipPath={`url(#${clip0})`}>
          <rect
            fill="var(--tag-outer)"
            height={44}
            rx={22}
            shapeRendering="crispEdges"
            width={44}
            x={3.25}
            y={2}
          />
          <g opacity={0.32}>
            {CIRCULAR_STRIPES.map((stripe, index) => (
              <rect
                fill={`url(#${paintStripe[index]})`}
                height={64}
                key={paintStripe[index]}
                transform={`rotate(45 ${stripe.x} ${stripe.y})`}
                width={stripe.width}
                x={stripe.x}
                y={stripe.y}
              />
            ))}
          </g>
        </g>
        <rect
          height={44}
          rx={22}
          shapeRendering="crispEdges"
          stroke={`url(#${paint7})`}
          strokeWidth={0.5}
          width={44}
          x={3.25}
          y={2}
        />
      </g>
      <rect
        fill="var(--tag-inner)"
        height={35.5}
        rx={17.75}
        stroke={`url(#${paint8})`}
        strokeWidth={0.5}
        width={35.5}
        x={7.5}
        y={6.25}
      />
      <rect
        fill={`url(#${paint9})`}
        height={29.5}
        opacity={0.32}
        rx={14.75}
        stroke={`url(#${paint10})`}
        strokeWidth={0.5}
        width={29.5}
        x={10.5}
        y={9.25}
      />
      <defs>
        <DropShadowFilter
          height={50.5}
          id={filter0}
          uid={uid}
          width={50.5}
          x={0}
          y={0.75}
        />
        {CIRCULAR_STRIPES.map((stripe, index) => (
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={paintStripe[index]}
            key={paintStripe[index]}
            x1={stripe.gx}
            x2={stripe.gx}
            y1={stripe.gy1}
            y2={stripe.gy2}
          >
            <ShineStops />
          </linearGradient>
        ))}
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint7}
          x1={25.25}
          x2={25.25}
          y1={2}
          y2={46}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint8}
          x1={25.25}
          x2={25.25}
          y1={6}
          y2={42}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint9}
          x1={25.25}
          x2={25.25}
          y1={9}
          y2={39}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint10}
          x1={25.25}
          x2={25.25}
          y1={9}
          y2={39}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <clipPath id={clip0}>
          <rect fill="white" height={44} rx={22} width={44} x={3.25} y={2} />
        </clipPath>
      </defs>
    </svg>
  );
}

const SHIELD1_OUTER =
  "M4 7.91663C4 4.23475 6.98475 1.25 10.6666 1.25H37.3334C41.0152 1.25 44 4.23475 44 7.91663V33.3082C44 35.7395 42.6765 37.978 40.5461 39.1496L27.2128 46.483C25.2122 47.5833 22.7878 47.5833 20.7872 46.483L7.45385 39.1496C5.32354 37.978 4 35.7395 4 33.3082V7.91663Z";

const SHIELD1_MID =
  "M11 5.5H37C38.5188 5.5 39.75 6.73122 39.75 8.25V33.6523C39.75 34.654 39.2052 35.5767 38.3281 36.0605L25.3281 43.2314C24.5013 43.6875 23.4987 43.6875 22.6719 43.2314L9.67188 36.0605C8.7948 35.5767 8.25 34.654 8.25 33.6523V8.25C8.25 6.73122 9.48122 5.5 11 5.5Z";

const SHIELD1_INNER =
  "M12 8.5H36C36.4142 8.5 36.75 8.83579 36.75 9.25V33.0859C36.7498 33.3524 36.6081 33.599 36.3779 33.7334L24.3779 40.7393C24.1443 40.8757 23.8557 40.8757 23.6221 40.7393L11.6221 33.7334C11.3919 33.599 11.2502 33.3524 11.25 33.0859V9.25C11.25 8.83579 11.5858 8.5 12 8.5Z";

const SHIELD1_MASK_STRIPES = [
  { x: 25.8203, y: -19.3691, width: 8 },
  { x: 34.3057, y: -10.8838, width: 3 },
  { x: 39.2549, y: -5.93408, width: 1 },
  { x: 42.084, y: -3.10547, width: 18 },
  { x: 61.8828, y: 16.6934, width: 10 },
  { x: 57.6396, y: 12.4507, width: 2 },
  { x: 69.6611, y: 24.4717, width: 2 },
] as const;

function WavyFrame({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const filter0 = `filter0_dd_${uid}`;
  const filter1 = `filter1_dd_${uid}`;
  const mask0 = `mask0_${uid}`;
  const paint0 = `paint0_linear_${uid}`;
  const paint1 = `paint1_linear_${uid}`;
  const paint2 = `paint2_linear_${uid}`;
  const paint3 = `paint3_linear_${uid}`;
  const paint4 = `paint4_linear_${uid}`;

  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 52 52"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filter0})`}>
        <path
          d={WAVY_OUTER}
          fill="var(--tag-outer)"
          shapeRendering="crispEdges"
        />
        <path
          d={WAVY_OUTER}
          shapeRendering="crispEdges"
          stroke={`url(#${paint0})`}
          strokeWidth={0.5}
        />
      </g>
      <mask
        height={92}
        id={mask0}
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
        width={92}
        x={-20}
        y={-22}
      >
        <g opacity={0.32}>
          {WAVY_MASK_STRIPES.map((stripe) => (
            <rect
              fill="black"
              height={64}
              key={`${stripe.x}-${stripe.y}`}
              transform={`rotate(-45 ${stripe.x} ${stripe.y})`}
              width={stripe.width}
              x={stripe.x}
              y={stripe.y}
            />
          ))}
        </g>
      </mask>
      <g mask={`url(#${mask0})`}>
        <g filter={`url(#${filter1})`}>
          <path
            d={WAVY_OUTER}
            fill={`url(#${paint1})`}
            shapeRendering="crispEdges"
          />
        </g>
      </g>
      <path
        d={WAVY_MID}
        fill="var(--tag-inner)"
        stroke={`url(#${paint2})`}
        strokeWidth={0.5}
      />
      <path
        d={WAVY_INNER}
        fill={`url(#${paint3})`}
        opacity={0.32}
        stroke={`url(#${paint4})`}
        strokeWidth={0.5}
      />
      <defs>
        <DropShadowFilter
          height={51.8389}
          id={filter0}
          uid={`${uid}_a`}
          width={51.8398}
          x={0}
          y={0.0805664}
        />
        <DropShadowFilter
          height={51.3389}
          id={filter1}
          uid={`${uid}_b`}
          width={51.3398}
          x={0.25}
          y={0.330566}
        />
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint0}
          x1={25.9199}
          x2={25.9199}
          y1={-2}
          y2={50}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint1}
          x1={25.9199}
          x2={25.9199}
          y1={-2}
          y2={50}
        >
          <ShineStops />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint2}
          x1={25.9199}
          x2={25.9199}
          y1={3}
          y2={45}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint3}
          x1={25.9199}
          x2={25.9199}
          y1={7}
          y2={41}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint4}
          x1={25.9199}
          x2={25.9199}
          y1={7}
          y2={41}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

const SHIELD2_OUTER =
  "M3.25 6.39046C3.25 3.55146 5.55146 1.25 8.39046 1.25H40.1095C42.9485 1.25 45.25 3.55146 45.25 6.39046V14.5044C45.25 27.8731 37.8295 40.1369 25.9871 46.3401C24.8991 46.91 23.6009 46.91 22.5129 46.3401C10.6705 40.1369 3.25 27.8731 3.25 14.5044V6.39046Z";

const SHIELD2_MID =
  "M9.88574 5.5H38.6143C39.9318 5.50004 41 6.56815 41 7.88574V14.9043C41 26.0522 34.8608 36.2946 25.0293 41.5498C24.5423 41.81 23.9577 41.81 23.4707 41.5498C13.6392 36.2946 7.5 26.0522 7.5 14.9043V7.88574C7.50004 6.56815 8.56815 5.50004 9.88574 5.5Z";

const SHIELD2_INNER =
  "M10.0537 7.5H38.4463C38.752 7.50017 38.9998 7.74798 39 8.05371V14.7119C38.9999 24.856 33.3788 34.1646 24.4014 38.8877C24.3068 38.9374 24.1932 38.9374 24.0986 38.8877C15.1212 34.1646 9.50007 24.856 9.5 14.7119V8.05371L9.51172 7.94238C9.55602 7.72605 9.72605 7.55602 9.94238 7.51172L10.0537 7.5Z";

const SHIELD2_MASK_STRIPES = [
  { x: 24.25, y: -21.0039, width: 8 },
  { x: 32.7354, y: -12.5186, width: 3 },
  { x: 37.6846, y: -7.56885, width: 1 },
  { x: 40.5137, y: -4.74023, width: 18 },
  { x: 60.3125, y: 15.0586, width: 10 },
  { x: 56.0693, y: 10.8159, width: 2 },
  { x: 68.0908, y: 22.8369, width: 2 },
] as const;

function Shield1Frame({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const filter0 = `filter0_dd_${uid}`;
  const filter1 = `filter1_dd_${uid}`;
  const mask0 = `mask0_${uid}`;
  const paint0 = `paint0_linear_${uid}`;
  const paint1 = `paint1_linear_${uid}`;
  const paint2 = `paint2_linear_${uid}`;
  const paint3 = `paint3_linear_${uid}`;
  const paint4 = `paint4_linear_${uid}`;
  const paint5 = `paint5_linear_${uid}`;

  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 48 53"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filter0})`}>
        <path
          d={SHIELD1_OUTER}
          fill="var(--tag-outer)"
          shapeRendering="crispEdges"
        />
        <path
          d={SHIELD1_OUTER}
          shapeRendering="crispEdges"
          stroke={`url(#${paint0})`}
          strokeWidth={0.5}
        />
      </g>
      <g opacity={0.32}>
        <mask
          height={92}
          id={mask0}
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
          width={92}
          x={-20}
          y={-20}
        >
          {SHIELD1_MASK_STRIPES.map((stripe) => (
            <rect
              fill="#FAFAFA"
              height={64}
              key={`${stripe.x}-${stripe.y}`}
              transform={`rotate(45 ${stripe.x} ${stripe.y})`}
              width={stripe.width}
              x={stripe.x}
              y={stripe.y}
            />
          ))}
        </mask>
        <g mask={`url(#${mask0})`}>
          <g filter={`url(#${filter1})`}>
            <path
              d={SHIELD1_OUTER}
              fill={`url(#${paint1})`}
              shapeRendering="crispEdges"
            />
            <path
              d={SHIELD1_OUTER}
              shapeRendering="crispEdges"
              stroke={`url(#${paint2})`}
              strokeWidth={0.5}
            />
          </g>
        </g>
      </g>
      <path
        d={SHIELD1_MID}
        fill="var(--tag-inner)"
        stroke={`url(#${paint3})`}
        strokeWidth={0.5}
      />
      <path
        d={SHIELD1_INNER}
        fill={`url(#${paint4})`}
        opacity={0.32}
        stroke={`url(#${paint5})`}
        strokeWidth={0.5}
      />
      <defs>
        <DropShadowFilter
          height={52.5581}
          id={filter0}
          uid={`${uid}_a`}
          width={46.5}
          x={0.75}
          y={0}
        />
        <DropShadowFilter
          height={52.5581}
          id={filter1}
          uid={`${uid}_b`}
          width={46.5}
          x={0.75}
          y={0}
        />
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint0}
          x1={24}
          x2={24}
          y1={1.25}
          y2={48.25}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint1}
          x1={24}
          x2={24}
          y1={1.25}
          y2={48.25}
        >
          <ShineStops />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint2}
          x1={24}
          x2={24}
          y1={1.25}
          y2={48.25}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint3}
          x1={24}
          x2={24}
          y1={5.25}
          y2={44.25}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint4}
          x1={24}
          x2={24}
          y1={8.25}
          y2={41.25}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint5}
          x1={24}
          x2={24}
          y1={8.25}
          y2={41.25}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Shield2Frame({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const filter0 = `filter0_dd_${uid}`;
  const filter1 = `filter1_dd_${uid}`;
  const mask0 = `mask0_${uid}`;
  const paint0 = `paint0_linear_${uid}`;
  const paint1 = `paint1_linear_${uid}`;
  const paint2 = `paint2_linear_${uid}`;
  const paint3 = `paint3_linear_${uid}`;
  const paint4 = `paint4_linear_${uid}`;

  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 49 53"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filter0})`}>
        <path
          d={SHIELD2_OUTER}
          fill="var(--tag-outer)"
          shapeRendering="crispEdges"
        />
        <path
          d={SHIELD2_OUTER}
          shapeRendering="crispEdges"
          stroke={`url(#${paint0})`}
          strokeWidth={0.5}
        />
      </g>
      <mask
        height={92}
        id={mask0}
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
        width={92}
        x={-22}
        y={-22}
      >
        <g opacity={0.32}>
          {SHIELD2_MASK_STRIPES.map((stripe) => (
            <rect
              fill="black"
              height={64}
              key={`${stripe.x}-${stripe.y}`}
              transform={`rotate(45 ${stripe.x} ${stripe.y})`}
              width={stripe.width}
              x={stripe.x}
              y={stripe.y}
            />
          ))}
        </g>
      </mask>
      <g mask={`url(#${mask0})`}>
        <g filter={`url(#${filter1})`}>
          <path
            d={SHIELD2_OUTER}
            fill={`url(#${paint1})`}
            shapeRendering="crispEdges"
          />
        </g>
      </g>
      <path
        d={SHIELD2_MID}
        fill="var(--tag-inner)"
        stroke={`url(#${paint2})`}
        strokeWidth={0.5}
      />
      <path
        d={SHIELD2_INNER}
        fill={`url(#${paint3})`}
        opacity={0.32}
        stroke={`url(#${paint4})`}
        strokeWidth={0.5}
      />
      <defs>
        <DropShadowFilter
          height={52.0176}
          id={filter0}
          uid={`${uid}_a`}
          width={48.5}
          x={0}
          y={0}
        />
        <DropShadowFilter
          height={51.5176}
          id={filter1}
          uid={`${uid}_b`}
          width={48}
          x={0.25}
          y={0.25}
        />
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint0}
          x1={24.25}
          x2={24.25}
          y1={1.25}
          y2={47.25}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint1}
          x1={24.25}
          x2={24.25}
          y1={1.25}
          y2={47.25}
        >
          <ShineStops />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint2}
          x1={24.25}
          x2={24.25}
          y1={5.25}
          y2={42.25}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint3}
          x1={24.25}
          x2={24.25}
          y1={7.25}
          y2={39.25}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint4}
          x1={24.25}
          x2={24.25}
          y1={7.25}
          y2={39.25}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

const FRAME_BY_VARIANT: Record<
  AchievementTagVariant,
  (props: { className?: string }) => JSX.Element
> = {
  polygon: PolygonFrame,
  circular: CircularFrame,
  wavy: WavyFrame,
  shield1: Shield1Frame,
  shield2: Shield2Frame,
  octagon: OctagonFrame,
  diamond: DiamondFrame,
  star1: Star1Frame,
  star2: Star2Frame,
};

const ICON_SIZE_PX = {
  sm: 15,
  md: 20,
  lg: 27,
} as const;

export function AchievementTag({
  variant = "polygon",
  color = "accent",
  size = "md",
  icon,
  // badgeIcon,
  className,
  ...props
}: AchievementTagProps) {
  const slots = achievementTagVariants({ variant, color, size });
  const Frame = FRAME_BY_VARIANT[variant];

  return (
    <Card
      className={slots.root({ className })}
      data-color={color}
      data-size={size}
      data-variant={variant}
      variant="transparent"
      {...props}
    >
      <Frame className={slots.frame()} />

      <span aria-hidden className={slots.iconWrap()}>
        {icon ?? (
          <BarbellDiagonal className={slots.icon()} size={ICON_SIZE_PX[size]} />
        )}
      </span>

      {/* <span aria-hidden className={slots.badge()}>
        {badgeIcon ?? (
          <Logo
            aria-hidden
            className={slots.badgeIcon()}
            color="var(--achievement)"
            gradient={false}
            shadow={false}
            size={12}
            title=""
          />
        )}
      </span> */}
    </Card>
  );
}
