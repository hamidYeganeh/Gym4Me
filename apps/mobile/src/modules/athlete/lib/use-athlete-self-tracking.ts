"use client";

import { useMemo, useState } from "react";
import {
  PERSONAL_RECORD_TYPES,
  type SelfTrackingMetric,
} from "./self-tracking-data";
import {
  formatSelfTrackingDate,
  localDateTimeValue,
} from "./self-tracking-helpers";
import type { AthleteSelfTrackingScreenProps } from "../screens/AthleteSelfTrackingScreen/AthleteSelfTrackingScreen.types";

export function useAthleteSelfTracking({
  catalog,
  metrics,
  personalRecords,
  summary = [],
  pendingQueue = [],
  pending = false,
  personalRecordsEnabled = true,
  initialMetric,
  onCreateMetric,
  onDeleteMetric,
  onCreatePersonalRecord,
  onFlushPending,
}: AthleteSelfTrackingScreenProps) {
  const fallbackKey = catalog[0]?.key ?? "water_ml";
  const [selectedKey, setSelectedKey] = useState(
    catalog.some((item) => item.key === initialMetric)
      ? (initialMetric as string)
      : fallbackKey,
  );
  const [value, setValue] = useState("");
  const [recordedAt, setRecordedAt] = useState(localDateTimeValue);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordType, setRecordType] = useState<string>(
    PERSONAL_RECORD_TYPES[0].key,
  );
  const [recordValue, setRecordValue] = useState("");
  const [recordDate, setRecordDate] = useState(localDateTimeValue);

  const selected: SelfTrackingMetric =
    catalog.find((item) => item.key === selectedKey) ??
    catalog[0] ?? {
      key: fallbackKey,
      label: fallbackKey,
      unit: "",
      unitLabel: "",
      hint: "",
      min: 0,
      max: 1_000_000,
      step: 1,
    };

  const selectedHistory = useMemo(() => {
    const server = metrics
      .filter((item) => item.metricKey === selected.key)
      .slice(0, 20)
      .map((item) => ({
        id: item.id,
        value: item.value,
        recordedAt: item.recordedAt,
        pending: false as boolean,
        deletable: true,
      }));

    const offline = pendingQueue
      .filter(
        (item): item is Extract<typeof item, { kind: "metric" }> =>
          item.kind === "metric" &&
          item.payload.metricKey === selected.key &&
          item.status !== "synced",
      )
      .map((item) => ({
        id: item.id,
        value: item.payload.value,
        recordedAt: item.payload.recordedAt,
        pending: true,
        deletable: false,
      }));

    return [...offline, ...server].slice(0, 20);
  }, [metrics, pendingQueue, selected.key]);

  const summaryByKey = useMemo(() => {
    const map = new Map(summary.map((item) => [item.metricKey, item]));
    return map;
  }, [summary]);

  const selectedSummary = summaryByKey.get(selected.key);

  function selectMetric(key: string) {
    setSelectedKey(key);
    setMessage(null);
    setError(null);
  }

  async function submitMetric() {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    setError(null);
    setMessage(null);
    try {
      const result = await onCreateMetric({
        metricKey: selected.key,
        value: parsed,
        recordedAt: new Date(recordedAt).toISOString(),
        unit: selected.unit,
        note: note.trim() || undefined,
      });
      setValue("");
      setNote("");
      if (result?.queuedOffline) {
        setMessage(
          `${selected.label} در صف آفلاین ذخیره شد و بعد از اتصال همگام می‌شود.`,
        );
      } else {
        setMessage(`${selected.label} با موفقیت ثبت شد.`);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ثبت داده ناموفق بود.");
    }
  }

  async function submitPersonalRecord() {
    const parsed = Number(recordValue);
    if (!Number.isFinite(parsed)) return;
    setError(null);
    setMessage(null);
    try {
      await onCreatePersonalRecord({
        metricTypeKey: recordType,
        value: parsed,
        achievedAt: new Date(recordDate).toISOString(),
      });
      setRecordValue("");
      setMessage("رکورد شخصی با موفقیت ثبت شد.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ثبت رکورد ناموفق بود.");
    }
  }

  return {
    catalog,
    personalRecords,
    pendingQueue,
    pending,
    personalRecordsEnabled,
    selected,
    selectedHistory,
    selectedSummary,
    value,
    recordedAt,
    note,
    message,
    error,
    recordType,
    recordValue,
    recordDate,
    formatDate: formatSelfTrackingDate,
    selectMetric,
    setValue,
    setRecordedAt,
    setNote,
    setRecordType,
    setRecordValue,
    setRecordDate,
    submitMetric,
    submitPersonalRecord,
    onDeleteMetric,
    onFlushPending,
  };
}

export type UseAthleteSelfTrackingReturn = ReturnType<
  typeof useAthleteSelfTracking
>;
