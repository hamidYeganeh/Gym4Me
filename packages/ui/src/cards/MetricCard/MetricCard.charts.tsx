"use client";

import { curveMonotoneX, curveStepAfter } from "@visx/curve";
import { Check } from "@repo/icons/Check";
import { SmileDepressed } from "@repo/icons/SmileDepressed";
import { SmileHappy } from "@repo/icons/SmileHappy";
import { SmileNeutral } from "@repo/icons/SmileNeutral";
import { SmileOverjoyed } from "@repo/icons/SmileOverjoyed";
import { SmileSad } from "@repo/icons/SmileSad";
import type { CSSProperties, ReactNode } from "react";
import { Area } from "../../components/charts/area";
import { AreaChart } from "../../components/charts/area-chart";
import { Bar } from "../../components/charts/bar";
import { BarChart } from "../../components/charts/bar-chart";
import { Ring } from "../../components/charts/ring";
import { RingChart } from "../../components/charts/ring-chart";
import { CHART_MARGIN, toIndexedTimeSeries } from "../../lib/chart-series";
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

const DEFAULT_STACK_OPACITIES = [1, 0.72, 0.45] as const;
const TRACK_FILL = "var(--surface-secondary)";

function accentStyle(color: string): CSSProperties {
  return { ["--metric-accent" as string]: color };
}

function normalizeSeries(series: readonly number[]): number[] {
  const max = Math.max(...series, 0.0001);
  return series.map((value) => Math.min(1, Math.max(0, value / max)));
}

function mixAccent(color: string, opacity: number): string {
  return `color-mix(in oklab, ${color} ${Math.round(opacity * 100)}%, transparent)`;
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
  const color = chart.color ?? accent;
  const series = toIndexedTimeSeries(chart.series);
  const curve = chart.curve === "step" ? curveStepAfter : curveMonotoneX;

  return (
    <div className={slots.linePlot()} style={accentStyle(color)}>
      <AreaChart
        animationDuration={0}
        aspectRatio="auto"
        className="h-full w-full"
        data={series}
        margin={CHART_MARGIN.sparkline}
        style={{ height: "100%" }}
        xDataKey="date"
      >
        <Area
          animate={false}
          curve={curve}
          dataKey="value"
          fill={color}
          fillOpacity={0.35}
          showHighlight={false}
          stroke={color}
          strokeWidth={2.25}
        />
      </AreaChart>
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
    name: String(index),
    value: Math.max(height, height > 0 ? 0.14 : 0),
  }));

  return (
    <div aria-hidden className={slots.chartPlot()} style={accentStyle(color)}>
      <BarChart
        animationDuration={0}
        aspectRatio="auto"
        className="h-full min-w-0 flex-1"
        data={data}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        xDataKey="name"
      >
        <Bar
          animate={false}
          dataKey="value"
          fill={color}
          lineCap="round"
          minBarHeight={6}
        />
      </BarChart>
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
  const color = chart.color ?? accent;
  const opacities = chart.opacities ?? DEFAULT_STACK_OPACITIES;
  const maxSegments = Math.max(
    1,
    ...chart.series.map((segments) => Math.min(3, segments.length)),
  );

  const data = chart.series.map((segments, index) => {
    const row: Record<string, number | string> = { name: String(index) };
    for (let i = 0; i < maxSegments; i += 1) {
      row[`s${i}`] = Math.max(segments[i] ?? 0, 0);
    }
    return row;
  });

  return (
    <div aria-hidden className={slots.chartPlot()} style={accentStyle(color)}>
      <BarChart
        animationDuration={0}
        aspectRatio="auto"
        className="h-full min-w-0 flex-1"
        data={data}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        stacked
        xDataKey="name"
      >
        {Array.from({ length: maxSegments }, (_, segmentIndex) => {
          const opacity =
            opacities[Math.min(segmentIndex, opacities.length - 1)] ?? 1;
          const isTop = segmentIndex === maxSegments - 1;
          return (
            <Bar
              animate={false}
              dataKey={`s${segmentIndex}`}
              fill={mixAccent(color, opacity)}
              key={`s${segmentIndex}`}
              lineCap={isTop ? "round" : "butt"}
            />
          );
        })}
      </BarChart>
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
  const color = chart.color ?? accent;
  const lows = chart.series.map((item) => item.low);
  const highs = chart.series.map((item) => item.high);
  const min = Math.min(...lows, ...highs);
  const max = Math.max(...lows, ...highs);
  const span = max - min || 1;
  const trackFill = chart.trackColor ?? TRACK_FILL;

  const data = chart.series.map((item, index) => {
    const naturalMid = Math.max(item.high - item.low, 0);
    const mid = Math.min(Math.max(naturalMid, span * 0.1), span);
    const maxBase = Math.max(span - mid, 0);
    const base = Math.min(Math.max(item.low - min, 0), maxBase);
    return { name: String(index), base, mid };
  });

  return (
    <div aria-hidden className={slots.chartPlot()} style={accentStyle(color)}>
      <BarChart
        animationDuration={0}
        aspectRatio="auto"
        className="h-full min-w-0 flex-1"
        data={data}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        stacked
        xDataKey="name"
      >
        <Bar animate={false} dataKey="base" fill={trackFill} lineCap="butt" />
        <Bar animate={false} dataKey="mid" fill={color} lineCap="round" />
      </BarChart>
    </div>
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
  const ringSize = 18;

  return (
    <div aria-hidden className={slots.rings()} style={accentStyle(color)}>
      {chart.series.map((item, index) => {
        const met = item.met ?? item.value >= 0.85;

        return (
          <div className={slots.ringCol()} key={`${index}-${item.value}`}>
            <RingChart
              baseInnerRadius={5}
              className={slots.ringSvg()}
              data={[
                {
                  label: "",
                  value: item.value,
                  maxValue: 1,
                  color,
                },
              ]}
              ringGap={0}
              size={ringSize}
              strokeWidth={2.25}
            >
              <Ring index={0} showGlow={false} />
            </RingChart>
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
