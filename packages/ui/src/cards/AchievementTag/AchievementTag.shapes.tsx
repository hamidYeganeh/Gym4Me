"use client";

import { useId } from "react";

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

type ShineStripe = {
  x: number;
  y: number;
  width: number;
  gx: number;
  gy1: number;
  gy2: number;
};

const OCTAGON_OUTER =
  "M14.3799 4.17157C15.1301 3.42143 16.1475 3 17.2084 3L31.2916 3C32.3525 3 33.3699 3.42143 34.1201 4.17157L44.0784 14.1299C44.8286 14.8801 45.25 15.8975 45.25 16.9584V31.0416C45.25 32.1025 44.8286 33.1199 44.0784 33.8701L34.1201 43.8284C33.3699 44.5786 32.3525 45 31.2916 45H17.2084C16.1475 45 15.1301 44.5786 14.3799 43.8284L4.42157 33.8701C3.67143 33.1199 3.25 32.1025 3.25 31.0416L3.25 16.9584C3.25 15.8975 3.67143 14.8801 4.42157 14.1299L14.3799 4.17157Z";

const OCTAGON_MID =
  "M18.0371 7.25H30.4629C30.9269 7.25 31.372 7.4346 31.7002 7.7627L40.4873 16.5498C40.8154 16.878 41 17.3231 41 17.7871V30.2129C41 30.6769 40.8154 31.122 40.4873 31.4502L31.7002 40.2373C31.372 40.5654 30.9269 40.75 30.4629 40.75H18.0371C17.5731 40.75 17.128 40.5654 16.7998 40.2373L8.0127 31.4502C7.6846 31.122 7.5 30.6769 7.5 30.2129V17.7871C7.5 17.3231 7.6846 16.878 8.0127 16.5498L16.7998 7.7627C17.128 7.4346 17.5731 7.25 18.0371 7.25Z";

const OCTAGON_INNER =
  "M18.8652 10.25H29.6348C29.8337 10.25 30.0244 10.3291 30.165 10.4697L37.7803 18.085C37.9209 18.2256 38 18.4163 38 18.6152V29.3848C38 29.5837 37.9209 29.7744 37.7803 29.915L30.165 37.5303C30.0244 37.6709 29.8337 37.75 29.6348 37.75H18.8652C18.6663 37.75 18.4756 37.6709 18.335 37.5303L10.7197 29.915C10.5791 29.7744 10.5 29.5837 10.5 29.3848V18.6152C10.5 18.4163 10.5791 18.2256 10.7197 18.085L18.335 10.4697C18.4756 10.3291 18.6663 10.25 18.8652 10.25Z";

const OCTAGON_MASK_STRIPES = [
  { x: 24.25, y: -21, width: 8 },
  { x: 32.7354, y: -12.5146, width: 3 },
  { x: 37.6846, y: -7.56494, width: 1 },
  { x: 40.5137, y: -4.73633, width: 18 },
  { x: 60.3125, y: 15.0625, width: 10 },
  { x: 56.0693, y: 10.8198, width: 2 },
  { x: 68.0908, y: 22.8408, width: 2 },
] as const;

const DIAMOND_STRIPES: ShineStripe[] = [
  {
    x: 28.8203,
    y: -18.6191,
    width: 8,
    gx: 32.8203,
    gy1: -18.6191,
    gy2: 45.3809,
  },
  {
    x: 37.3047,
    y: -10.1338,
    width: 3,
    gx: 38.8047,
    gy1: -10.1338,
    gy2: 53.8662,
  },
  {
    x: 42.2559,
    y: -5.18408,
    width: 1,
    gx: 42.7559,
    gy1: -5.18408,
    gy2: 58.8159,
  },
  {
    x: 45.084,
    y: -2.35547,
    width: 18,
    gx: 54.084,
    gy1: -2.35547,
    gy2: 61.6445,
  },
  {
    x: 64.8828,
    y: 17.4434,
    width: 10,
    gx: 69.8828,
    gy1: 17.4434,
    gy2: 81.4434,
  },
  {
    x: 60.6406,
    y: 13.2007,
    width: 2,
    gx: 61.6406,
    gy1: 13.2007,
    gy2: 77.2007,
  },
  {
    x: 72.6602,
    y: 25.2217,
    width: 2,
    gx: 73.6602,
    gy1: 25.2217,
    gy2: 89.2217,
  },
];

const STAR2_OUTER =
  "M25.8601 1.88419C26.6506 1.03837 27.9919 1.03838 28.7825 1.88419L33.8761 7.33415C34.2704 7.756 34.8277 7.98687 35.4048 7.96737L42.8603 7.71541C44.0173 7.67631 44.9658 8.62476 44.9267 9.78182L44.6747 17.2373C44.6552 17.8144 44.8861 18.3717 45.3079 18.766L50.7579 23.8596C51.6037 24.6501 51.6037 25.9915 50.7579 26.782L45.3079 31.8756C44.8861 32.2699 44.6552 32.8272 44.6747 33.4043L44.9267 40.8598C44.9658 42.0168 44.0173 42.9653 42.8603 42.9262L35.4048 42.6742C34.8277 42.6547 34.2704 42.8856 33.8761 43.3075L28.7825 48.7574C27.9919 49.6032 26.6506 49.6032 25.8601 48.7574L20.7665 43.3075C20.3722 42.8856 19.8148 42.6547 19.2378 42.6742L11.7823 42.9262C10.6252 42.9653 9.67679 42.0168 9.7159 40.8598L9.96785 33.4043C9.98736 32.8272 9.75649 32.2699 9.33464 31.8756L3.88468 26.782C3.03886 25.9915 3.03886 24.6501 3.88468 23.8596L9.33464 18.766C9.75649 18.3717 9.98736 17.8144 9.96785 17.2373L9.7159 9.78182C9.67679 8.62476 10.6253 7.67631 11.7823 7.71541L19.2378 7.96737C19.8148 7.98687 20.3722 7.756 20.7665 7.33415L25.8601 1.88419Z";

const STAR2_MID =
  "M26.7734 6.27295C27.0698 5.95601 27.5727 5.95601 27.8691 6.27295L32.5684 11.3013C32.8148 11.5649 33.1637 11.709 33.5244 11.6968L40.4023 11.4644C40.8362 11.4497 41.1924 11.8059 41.1777 12.2397L40.9453 19.1177C40.9331 19.4784 41.0772 19.8273 41.3408 20.0737L46.3691 24.7729C46.6861 25.0694 46.6861 25.5722 46.3691 25.8687L41.3408 30.5679C41.0772 30.8143 40.9331 31.1632 40.9453 31.5239L41.1777 38.4019C41.1924 38.8358 40.8362 39.1919 40.4023 39.1772L33.5244 38.9448C33.1637 38.9326 32.8148 39.0767 32.5684 39.3403L27.8691 44.3687C27.5727 44.6856 27.0698 44.6856 26.7734 44.3687L22.0742 39.3403C21.8278 39.0767 21.4788 38.9326 21.1182 38.9448L14.2402 39.1772C13.8063 39.1919 13.4502 38.8358 13.4648 38.4019L13.6973 31.5239C13.7095 31.1632 13.5654 30.8143 13.3018 30.5679L8.27344 25.8687C7.9565 25.5722 7.95649 25.0694 8.27344 24.7729L13.3018 20.0737C13.5654 19.8273 13.7095 19.4784 13.6973 19.1177L13.4648 12.2397C13.4502 11.8058 13.8063 11.4497 14.2402 11.4644L21.1182 11.6968C21.4788 11.709 21.8278 11.5649 22.0742 11.3013L26.7734 6.27295Z";

const STAR2_INNER =
  "M27.1387 9.88232C27.2375 9.77664 27.4051 9.77664 27.5039 9.88232L31.5762 14.2388C31.724 14.3969 31.9331 14.4834 32.1494 14.4761L38.1084 14.2749C38.253 14.27 38.3721 14.3891 38.3672 14.5337L38.166 20.4927C38.1587 20.709 38.2452 20.9181 38.4033 21.0659L42.7598 25.1382C42.8655 25.237 42.8655 25.4046 42.7598 25.5034L38.4033 29.5757C38.2452 29.7235 38.1587 29.9326 38.166 30.1489L38.3672 36.1079C38.3721 36.2525 38.253 36.3716 38.1084 36.3667L32.1494 36.1655C31.9331 36.1582 31.724 36.2447 31.5762 36.4028L27.5039 40.7593C27.4051 40.865 27.2375 40.865 27.1387 40.7593L23.0664 36.4028C22.9186 36.2447 22.7095 36.1582 22.4932 36.1655L16.5342 36.3667C16.3895 36.3716 16.2705 36.2525 16.2754 36.1079L16.4766 30.1489C16.4839 29.9326 16.3974 29.7235 16.2393 29.5757L11.8828 25.5034C11.7771 25.4046 11.7771 25.237 11.8828 25.1382L16.2393 21.0659C16.3974 20.9181 16.4839 20.709 16.4766 20.4927L16.2754 14.5337C16.2705 14.3891 16.3895 14.27 16.5342 14.2749L22.4932 14.4761C22.7095 14.4834 22.9186 14.3969 23.0664 14.2388L27.1387 9.88232Z";

const STAR2_MASK_STRIPES = [
  { x: 27.3213, y: -19.6792, width: 8 },
  { x: 35.8066, y: -11.1938, width: 3 },
  { x: 40.7559, y: -6.24414, width: 1 },
  { x: 43.585, y: -3.41553, width: 18 },
  { x: 63.3838, y: 16.3833, width: 10 },
  { x: 59.1406, y: 12.1406, width: 2 },
  { x: 71.1621, y: 24.1616, width: 2 },
] as const;

const STAR1_OUTER =
  "M23.2603 2.05639C24.06 0.980898 25.6705 0.9809 26.4702 2.05639L32.7996 10.5687C33.1287 11.0112 33.6258 11.2982 34.1736 11.3619L44.7102 12.5872C46.0414 12.7421 46.8467 14.1368 46.3151 15.3671L42.108 25.1047C41.8892 25.6109 41.8892 26.185 42.108 26.6912L46.3151 36.4288C46.8467 37.6591 46.0414 39.0538 44.7102 39.2086L34.1736 40.434C33.6258 40.4977 33.1287 40.7847 32.7996 41.2272L26.4702 49.7395C25.6705 50.815 24.06 50.815 23.2603 49.7395L16.9308 41.2272C16.6018 40.7847 16.1047 40.4977 15.5569 40.434L5.02031 39.2086C3.68906 39.0538 2.88381 37.6591 3.41537 36.4288L7.62252 26.6912C7.84123 26.185 7.84123 25.6109 7.62252 25.1047L3.41537 15.3671C2.88381 14.1368 3.68906 12.7421 5.02031 12.5872L15.5569 11.3619C16.1047 11.2982 16.6018 11.0112 16.9308 10.5687L23.2603 2.05639Z";

const STAR1_MID =
  "M24.2637 6.12646C24.5636 5.72324 25.1669 5.72324 25.4668 6.12646L31.2314 13.8794C31.4371 14.156 31.7485 14.3347 32.0908 14.3745L41.6875 15.4907C42.1865 15.549 42.4883 16.0725 42.2891 16.5337L38.457 25.4019C38.3203 25.7182 38.3203 26.0777 38.457 26.394L42.2891 35.2622C42.4883 35.7234 42.1864 36.2469 41.6875 36.3052L32.0908 37.4214C31.7485 37.4612 31.4371 37.6399 31.2314 37.9165L25.4668 45.6694C25.1669 46.0727 24.5636 46.0727 24.2637 45.6694L18.499 37.9165C18.2934 37.6399 17.982 37.4612 17.6396 37.4214L8.04297 36.3052C7.54402 36.2469 7.24213 35.7234 7.44141 35.2622L11.2734 26.394C11.4101 26.0777 11.4101 25.7182 11.2734 25.4019L7.44141 16.5337C7.24213 16.0725 7.54402 15.549 8.04297 15.4907L17.6396 14.3745C17.982 14.3347 18.2934 14.156 18.499 13.8794L24.2637 6.12646Z";

const STAR1_INNER =
  "M24.665 9.58643C24.765 9.45252 24.9655 9.45252 25.0654 9.58643L30.0605 16.3042C30.1839 16.4701 30.3708 16.5782 30.5762 16.6021L38.8906 17.5688C39.057 17.5882 39.1582 17.7627 39.0918 17.9165L35.7715 25.6001C35.6895 25.7899 35.6895 26.006 35.7715 26.1958L39.0918 33.8794C39.1582 34.0332 39.057 34.2077 38.8906 34.2271L30.5762 35.1938C30.3708 35.2177 30.1839 35.3258 30.0605 35.4917L25.0654 42.2095C24.9655 42.3434 24.765 42.3434 24.665 42.2095L19.6699 35.4917C19.5465 35.3258 19.3597 35.2177 19.1543 35.1938L10.8398 34.2271C10.6734 34.2077 10.5722 34.0332 10.6387 33.8794L13.959 26.1958C14.041 26.006 14.041 25.7899 13.959 25.6001L10.6387 17.9165C10.5722 17.7627 10.6734 17.5882 10.8398 17.5688L19.1543 16.6021C19.3597 16.5782 19.5465 16.4701 19.6699 16.3042L24.665 9.58643Z";

const STAR1_MASK_STRIPES = [
  { x: 24.8652, y: -19.1021, width: 8 },
  { x: 33.3506, y: -10.6167, width: 3 },
  { x: 38.2998, y: -5.66699, width: 1 },
  { x: 41.1289, y: -2.83838, width: 18 },
  { x: 60.9277, y: 16.9604, width: 10 },
  { x: 56.6846, y: 12.7178, width: 2 },
  { x: 68.7061, y: 24.7388, width: 2 },
] as const;

export function OctagonFrame({ className }: { className?: string }) {
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
      viewBox="0 0 49 51"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filter0})`}>
        <path
          d={OCTAGON_OUTER}
          fill="var(--tag-outer)"
          shapeRendering="crispEdges"
        />
        <path
          d={OCTAGON_OUTER}
          shapeRendering="crispEdges"
          stroke={`url(#${paint0})`}
          strokeWidth={0.5}
        />
      </g>
      <g opacity={0.32}>
        <mask
          height={91}
          id={mask0}
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
          width={92}
          x={-22}
          y={-21}
        >
          {OCTAGON_MASK_STRIPES.map((stripe) => (
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
        </mask>
        <g mask={`url(#${mask0})`}>
          <g filter={`url(#${filter1})`}>
            <path
              d={OCTAGON_OUTER}
              fill={`url(#${paint1})`}
              shapeRendering="crispEdges"
            />
          </g>
        </g>
      </g>
      <path
        d={OCTAGON_MID}
        fill="var(--tag-inner)"
        stroke={`url(#${paint2})`}
        strokeWidth={0.5}
      />
      <path
        d={OCTAGON_INNER}
        fill={`url(#${paint3})`}
        opacity={0.32}
        stroke={`url(#${paint4})`}
        strokeWidth={0.5}
      />
      <defs>
        <DropShadowFilter
          height={48.5}
          id={filter0}
          uid={`${uid}_a`}
          width={48.5}
          x={0}
          y={1.75}
        />
        <DropShadowFilter
          height={48}
          id={filter1}
          uid={`${uid}_b`}
          width={48}
          x={0.25}
          y={2}
        />
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint0}
          x1={24.25}
          x2={24.25}
          y1={3}
          y2={45}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint1}
          x1={24.25}
          x2={24.25}
          y1={3}
          y2={45}
        >
          <ShineStops />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint2}
          x1={24.25}
          x2={24.25}
          y1={7}
          y2={41}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint3}
          x1={24.25}
          x2={24.25}
          y1={10}
          y2={38}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint4}
          x1={24.25}
          x2={24.25}
          y1={10}
          y2={38}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DiamondFrame({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const filter0 = `filter0_dd_${uid}`;
  const clip0 = `clip0_${uid}`;
  const paintStripe = DIAMOND_STRIPES.map(
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
      viewBox="0 0 58 58"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filter0})`}>
        <g clipPath={`url(#${clip0})`}>
          <rect
            fill="var(--tag-outer)"
            height={36.7696}
            rx={6.66663}
            shapeRendering="crispEdges"
            transform="rotate(45 29 1)"
            width={36.7696}
            x={29}
            y={1}
          />
          <g opacity={0.32}>
            {DIAMOND_STRIPES.map((stripe, index) => (
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
          height={36.7696}
          rx={6.66663}
          shapeRendering="crispEdges"
          stroke={`url(#${paint7})`}
          strokeWidth={0.5}
          transform="rotate(45 29 1)"
          width={36.7696}
          x={29}
          y={1}
        />
      </g>
      <rect
        fill="var(--tag-inner)"
        height={29.1986}
        rx={3.11844}
        stroke={`url(#${paint8})`}
        strokeWidth={0.5}
        transform="rotate(45 29 6.35355)"
        width={29.1986}
        x={29}
        y={6.35355}
      />
      <rect
        fill={`url(#${paint9})`}
        height={24.3701}
        opacity={0.32}
        rx={0.75}
        stroke={`url(#${paint10})`}
        strokeWidth={0.5}
        transform="rotate(45 29 9.76762)"
        width={24.3701}
        x={29}
        y={9.76762}
      />
      <defs>
        <DropShadowFilter
          height={58}
          id={filter0}
          uid={uid}
          width={58}
          x={0}
          y={0}
        />
        {DIAMOND_STRIPES.map((stripe, index) => (
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
          x1={47.3848}
          x2={47.3848}
          y1={1}
          y2={37.7696}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint8}
          x1={43.8493}
          x2={43.8493}
          y1={6}
          y2={35.6986}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint9}
          x1={41.435}
          x2={41.435}
          y1={9.41406}
          y2={34.2841}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint10}
          x1={41.435}
          x2={41.435}
          y1={9.41406}
          y2={34.2841}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <clipPath id={clip0}>
          <rect
            fill="white"
            height={36.7696}
            rx={6.66663}
            transform="rotate(45 29 1)"
            width={36.7696}
            x={29}
            y={1}
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export function Star2Frame({ className }: { className?: string }) {
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
      viewBox="0 0 55 55"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filter0})`}>
        <path
          d={STAR2_OUTER}
          fill="var(--tag-outer)"
          shapeRendering="crispEdges"
        />
        <path
          d={STAR2_OUTER}
          shapeRendering="crispEdges"
          stroke={`url(#${paint0})`}
          strokeWidth={0.5}
        />
      </g>
      <g opacity={0.32}>
        <mask
          height={91}
          id={mask0}
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
          width={91}
          x={-18}
          y={-20}
        >
          {STAR2_MASK_STRIPES.map((stripe) => (
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
              d={STAR2_OUTER}
              fill={`url(#${paint1})`}
              shapeRendering="crispEdges"
            />
          </g>
        </g>
      </g>
      <path
        d={STAR2_MID}
        fill="var(--tag-inner)"
        stroke={`url(#${paint2})`}
        strokeWidth={0.5}
      />
      <path
        d={STAR2_INNER}
        fill={`url(#${paint3})`}
        opacity={0.32}
        stroke={`url(#${paint4})`}
        strokeWidth={0.5}
      />
      <defs>
        <DropShadowFilter
          height={54.6416}
          id={filter0}
          uid={`${uid}_a`}
          width={54.6426}
          x={0}
          y={0}
        />
        <DropShadowFilter
          height={54.1416}
          id={filter1}
          uid={`${uid}_b`}
          width={54.1426}
          x={0.25}
          y={0.25}
        />
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint0}
          x1={27.3213}
          x2={27.3213}
          y1={0.320801}
          y2={50.3208}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint1}
          x1={27.3213}
          x2={27.3213}
          y1={0.320801}
          y2={50.3208}
        >
          <ShineStops />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint2}
          x1={27.3213}
          x2={27.3213}
          y1={5.3208}
          y2={45.3208}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint3}
          x1={27.3213}
          x2={27.3213}
          y1={9.3208}
          y2={41.3208}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint4}
          x1={27.3213}
          x2={27.3213}
          y1={9.3208}
          y2={41.3208}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Star1Frame({ className }: { className?: string }) {
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
      viewBox="0 0 50 56"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filter0})`}>
        <path
          d={STAR1_OUTER}
          fill="var(--tag-outer)"
          shapeRendering="crispEdges"
        />
        <path
          d={STAR1_OUTER}
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
          x={-21}
          y={-20}
        >
          {STAR1_MASK_STRIPES.map((stripe) => (
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
              d={STAR1_OUTER}
              fill={`url(#${paint1})`}
              shapeRendering="crispEdges"
            />
          </g>
        </g>
      </g>
      <path
        d={STAR1_MID}
        fill="var(--tag-inner)"
        stroke={`url(#${paint2})`}
        strokeWidth={0.5}
      />
      <path
        d={STAR1_INNER}
        fill={`url(#${paint3})`}
        opacity={0.32}
        stroke={`url(#${paint4})`}
        strokeWidth={0.5}
      />
      <defs>
        <DropShadowFilter
          height={55.7959}
          id={filter0}
          uid={`${uid}_a`}
          width={49.7305}
          x={0}
          y={0}
        />
        <DropShadowFilter
          height={55.2959}
          id={filter1}
          uid={`${uid}_b`}
          width={49.2305}
          x={0.25}
          y={0.25}
        />
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint0}
          x1={24.8652}
          x2={24.8652}
          y1={-0.102051}
          y2={51.8979}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint1}
          x1={24.8652}
          x2={24.8652}
          y1={-0.102051}
          y2={51.8979}
        >
          <ShineStops />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint2}
          x1={24.8652}
          x2={24.8652}
          y1={4.89795}
          y2={46.8979}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint3}
          x1={24.8652}
          x2={24.8652}
          y1={8.89795}
          y2={42.8979}
        >
          <stop stopColor="white" stopOpacity={0} />
          <stop offset={1} stopColor="white" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={paint4}
          x1={24.8652}
          x2={24.8652}
          y1={8.89795}
          y2={42.8979}
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}
