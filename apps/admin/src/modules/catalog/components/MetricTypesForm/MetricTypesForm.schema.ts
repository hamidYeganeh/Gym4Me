import { z } from "zod";
import type { MetricType, MetricValueKind } from "@repo/api";

export const METRIC_VALUE_KINDS: MetricValueKind[] = [
  "number",
  "pair",
  "range",
  "ratio",
  "text",
];

export type MetricTypesFormMessages = { required: string };

export function createMetricTypesFormSchema(
  messages: MetricTypesFormMessages,
  isEdit: boolean,
) {
  return z.object({
    key: isEdit
      ? z.string()
      : z.string().trim().min(1, messages.required),
    name: z.string().trim().min(1, messages.required),
    unit: z.string(),
    valueKind: z.custom<MetricValueKind>((value) =>
      typeof value === "string" &&
      (METRIC_VALUE_KINDS as string[]).includes(value),
    ),
  });
}

export type MetricTypesFormValues = z.infer<
  ReturnType<typeof createMetricTypesFormSchema>
>;

export const metricTypesFormDefaults: MetricTypesFormValues = {
  key: "",
  name: "",
  unit: "",
  valueKind: "number",
};

export function metricTypeToFormValues(item: MetricType): MetricTypesFormValues {
  return {
    key: item.key,
    name: item.name,
    unit: item.unit ?? "",
    valueKind: item.valueKind,
  };
}
