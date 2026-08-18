"use client";

import { Check } from "@repo/icons/Check";
import { SmileDepressed } from "@repo/icons/SmileDepressed";
import { SmileHappy } from "@repo/icons/SmileHappy";
import { SmileNeutral } from "@repo/icons/SmileNeutral";
import { SmileOverjoyed } from "@repo/icons/SmileOverjoyed";
import { SmileSad } from "@repo/icons/SmileSad";
import { useId, type CSSProperties, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { metricCardVariants } from "./MetricCard.styles";
import type {
  MetricCardBarsChart,
  MetricCardChart,
  MetricCardDotsChart,
  MetricCardLineChart,
  MetricCardMoodsChart,
  MetricCardRangeChart,
  MetricCardRingsChart,
  MetricCardStackedChart,
  MetricMood,
} from "./MetricCard.types";

type Slots = ReturnType<typeof metricCardVariants>;

const CHART_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };
const BAR_SIZE = 10;
const BAR_RADIUS = 999;
const TRACK_FILL = "var(--surface-secondary)";
const RING_TRACK = "var(--default)";
const DEFAULT_STACK_OPACITIES = [1, 0.72, 0.45] as const;

function accentStyle(color: string): CSSProperties {
  return { ["--metric-accent" as string]: color };
}

function normalizeSeries(series: readonly number[]): number[] {
  const max = Math.max(...series, 0.0001);
  return series.map((value) => Math.min(1, Math.max(0, value / max)));
}

function gradientIdFrom(useReactId: string): string {
  return `metric-area-${useReactId.replace(/:/g, "")}`;
}

const MOOD_ICONS: Record<
  MetricMood,
  (props: { className?: string; size?: number }) => ReactNode
> = {
  overjoyed: (props) => <SmileOverjoyed {...props} />,
  happy: (props) => <SmileHappy {...props} />,
  neutral: (props) => <SmileNeutral {...props} />,
  sad: (props) => <SmileSad {...props} />,
  depressed: (props) => <SmileDepressed {...props} />,
};

export function LineChart({
  chart,
  accent,
  slots,
}: {
  chart: MetricCardLineChart;
  accent: string;
  slots: Omit<Slots, "day">;
}) {
  const reactId = useId();
  const gradientId = gradientIdFrom(reactId);
  const color = chart.color ?? accent;
  const series = chart.series;
  const min = series.length > 0 ? Math.min(...series) * 0.92 : 0;
  const max = series.length > 0 ? Math.max(...series) * 1.05 : 1;
  const data = series.map((value, index) => ({ index, value }));
  const curve = chart.curve ?? "monotone";

  return (
    <div className={slots.linePlot()} style={accentStyle(color)}>
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="index" hide />
          <YAxis domain={[min, max]} hide type="number" />
          <Area
            activeDot={false}
            dataKey="value"
            dot={false}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.25}
            type={curve === "step" ? "stepAfter" : "monotone"}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarsChart({
  chart,
  accent,
  slots,
}: {
  chart: MetricCardBarsChart;
  accent: string;
  slots: Omit<Slots, "day">;
}) {
  const color = chart.color ?? accent;
  const heights = normalizeSeries(chart.series);
  const data = heights.map((height, index) => ({
    index,
    value: Math.max(height, height > 0 ? 0.14 : 0),
  }));
  const trackFill = chart.trackColor ?? TRACK_FILL;

  return (
    <div
      aria-hidden
      className={slots.chartPlot()}
      style={accentStyle(color)}
    >
      <div className="h-full min-w-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data} margin={CHART_MARGIN}>
            <XAxis dataKey="index" hide />
            <YAxis domain={[0, 1]} hide type="number" />
            <Bar
              background={{ fill: trackFill, radius: BAR_RADIUS }}
              barSize={BAR_SIZE}
              dataKey="value"
              fill={color}
              isAnimationActive={false}
              radius={BAR_RADIUS}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StackedChart({
  chart,
  accent,
  slots,
}: {
  chart: MetricCardStackedChart;
  accent: string;
  slots: Omit<Slots, "day">;
}) {
  const reactId = useId();
  const color = chart.color ?? accent;
  const opacities = chart.opacities ?? DEFAULT_STACK_OPACITIES;
  const maxSegments = Math.max(
    1,
    ...chart.series.map((segments) => Math.min(3, segments.length)),
  );

  const data = chart.series.map((segments, index) => {
    const row: Record<string, number> = { index };
    for (let i = 0; i < maxSegments; i += 1) {
      row[`s${i}`] = Math.max(segments[i] ?? 0, 0);
    }
    return row;
  });

  return (
    <div
      aria-hidden
      className={slots.chartPlot()}
      style={accentStyle(color)}
    >
      <div className="h-full min-w-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data} margin={CHART_MARGIN}>
            <defs>
              {Array.from({ length: maxSegments }, (_, segmentIndex) => {
                const opacity =
                  opacities[Math.min(segmentIndex, opacities.length - 1)] ?? 1;
                const id = `metric-stack-${reactId.replace(/:/g, "")}-${segmentIndex}`;
                return (
                  <linearGradient
                    id={id}
                    key={id}
                    x1="0"
                    x2="0"
                    y1="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={opacity} />
                    <stop
                      offset="100%"
                      stopColor={color}
                      stopOpacity={Math.min(1, opacity + 0.08)}
                    />
                  </linearGradient>
                );
              })}
            </defs>
            <XAxis dataKey="index" hide />
            <YAxis hide type="number" />
            {Array.from({ length: maxSegments }, (_, segmentIndex) => {
              const id = `metric-stack-${reactId.replace(/:/g, "")}-${segmentIndex}`;
              const isTop = segmentIndex === maxSegments - 1;
              const isBottom = segmentIndex === 0;
              const radius: [number, number, number, number] = isTop
                ? [BAR_RADIUS, BAR_RADIUS, 0, 0]
                : isBottom
                  ? [0, 0, BAR_RADIUS, BAR_RADIUS]
                  : [0, 0, 0, 0];

              return (
                <Bar
                  barSize={BAR_SIZE}
                  dataKey={`s${segmentIndex}`}
                  fill={`url(#${id})`}
                  isAnimationActive={false}
                  key={`s${segmentIndex}`}
                  radius={radius}
                  stackId="hydration"
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RangeChart({
  chart,
  accent,
  slots,
}: {
  chart: MetricCardRangeChart;
  accent: string;
  slots: Omit<Slots, "day">;
}) {
  const reactId = useId();
  const gradientId = `metric-range-${reactId.replace(/:/g, "")}`;
  const color = chart.color ?? accent;
  const lows = chart.series.map((item) => item.low);
  const highs = chart.series.map((item) => item.high);
  const min = Math.min(...lows, ...highs);
  const max = Math.max(...lows, ...highs);
  const span = max - min || 1;
  const trackFill = chart.trackColor ?? TRACK_FILL;

  const data = chart.series.map((item, index) => {
    const naturalMid = Math.max(item.high - item.low, 0);
    // Keep a minimum visible pill height (matches prior 10% floor).
    const mid = Math.min(Math.max(naturalMid, span * 0.1), span);
    const maxBase = Math.max(span - mid, 0);
    const base = Math.min(Math.max(item.low - min, 0), maxBase);
    return { index, base, mid };
  });

  return (
    <div
      aria-hidden
      className={slots.chartPlot()}
      style={accentStyle(color)}
    >
      <div className="h-full min-w-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="1" y2="0">
                <stop offset="0%" stopColor={color} stopOpacity={0.55} />
                <stop offset="100%" stopColor={color} stopOpacity={1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="index" hide />
            <YAxis domain={[0, span]} hide type="number" />
            <Bar
              background={{ fill: trackFill, radius: BAR_RADIUS }}
              barSize={BAR_SIZE}
              dataKey="base"
              fill="transparent"
              isAnimationActive={false}
              stackId="range"
            />
            <Bar
              barSize={BAR_SIZE}
              dataKey="mid"
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              radius={BAR_RADIUS}
              stackId="range"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RingProgress({
  value,
  color,
  size,
  className,
}: {
  value: number;
  color: string;
  size: number;
  className?: string;
}) {
  const stroke = size >= 24 ? 3 : 2.25;
  const outerRadius = size / 2;
  const innerRadius = Math.max(outerRadius - stroke, 1);
  const progress = Math.min(1, Math.max(0, value));
  const data = [
    { key: "value", value: progress },
    { key: "rest", value: 1 - progress },
  ];

  return (
    <PieChart className={className} height={size} width={size}>
      <Pie
        cx="50%"
        cy="50%"
        data={[{ key: "track", value: 1 }]}
        dataKey="value"
        endAngle={-270}
        fill={RING_TRACK}
        innerRadius={innerRadius}
        isAnimationActive={false}
        outerRadius={outerRadius}
        startAngle={90}
        stroke="none"
      />
      <Pie
        cx="50%"
        cy="50%"
        data={data}
        dataKey="value"
        endAngle={-270}
        innerRadius={innerRadius}
        isAnimationActive={false}
        outerRadius={outerRadius}
        paddingAngle={0}
        startAngle={90}
        stroke="none"
      >
        <Cell fill={color} />
        <Cell fill="transparent" />
      </Pie>
    </PieChart>
  );
}

export function RingsChart({
  chart,
  accent,
  slots,
}: {
  chart: MetricCardRingsChart;
  accent: string;
  slots: Omit<Slots, "day">;
}) {
  const color = chart.color ?? accent;
  // Match ringCol slot sizes: vertical 18px, horizontal 20px.
  const ringSize = 18;

  return (
    <div aria-hidden className={slots.rings()} style={accentStyle(color)}>
      {chart.series.map((item, index) => {
        const met = item.met ?? item.value >= 0.85;

        return (
          <div className={slots.ringCol()} key={`${index}-${item.value}`}>
            <RingProgress
              className={slots.ringSvg()}
              color={color}
              size={ringSize}
              value={item.value}
            />
            {met ? (
              <span className={slots.ringStatus()}>
                <Check
                  className={slots.ringStatusIcon()}
                  color={color}
                  size={8}
                />
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function DotsChart({
  chart,
  accent,
  slots,
}: {
  chart: MetricCardDotsChart;
  accent: string;
  slots: Omit<Slots, "day">;
}) {
  const color = chart.color ?? accent;
  const opacities = [1, 0.7, 0.4] as const;

  return (
    <div aria-hidden className={slots.dots()} style={accentStyle(color)}>
      {chart.series.map((filled, index) => {
        const count = Math.min(3, Math.max(0, Math.round(filled)));

        return (
          <div className={slots.dotCol()} key={`${index}-${count}`}>
            {opacities.map((opacity, dotIndex) => {
              const isFilled = dotIndex < count;
              return (
                <span
                  className={
                    isFilled
                      ? `${slots.dot()} ${slots.dotFilled()}`
                      : slots.dot()
                  }
                  key={dotIndex}
                  style={isFilled ? { opacity } : undefined}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function MoodsChart({
  chart,
  slots,
}: {
  chart: MetricCardMoodsChart;
  slots: Omit<Slots, "day">;
}) {
  return (
    <div aria-hidden className={slots.moods()}>
      {chart.series.map((mood, index) => {
        if (!mood) {
          return <span className={slots.moodEmpty()} key={index} />;
        }

        const Icon = MOOD_ICONS[mood];
        return (
          <span className={slots.moodIcon()} key={`${index}-${mood}`}>
            {Icon({ className: slots.moodIcon(), size: 14 })}
          </span>
        );
      })}
    </div>
  );
}

export function MetricCardChartView({
  chart,
  accent,
  slots,
}: {
  chart: MetricCardChart;
  accent: string;
  slots: Slots;
}) {
  switch (chart.type) {
    case "line":
      return <LineChart accent={accent} chart={chart} slots={slots} />;
    case "bars":
      return <BarsChart accent={accent} chart={chart} slots={slots} />;
    case "stacked":
      return <StackedChart accent={accent} chart={chart} slots={slots} />;
    case "range":
      return <RangeChart accent={accent} chart={chart} slots={slots} />;
    case "rings":
      return <RingsChart accent={accent} chart={chart} slots={slots} />;
    case "dots":
      return <DotsChart accent={accent} chart={chart} slots={slots} />;
    case "moods":
      return <MoodsChart chart={chart} slots={slots} />;
    default: {
      const _exhaustive: never = chart;
      return _exhaustive;
    }
  }
}
