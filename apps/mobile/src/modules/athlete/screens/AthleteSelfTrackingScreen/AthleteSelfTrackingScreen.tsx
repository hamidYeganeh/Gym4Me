"use client";

import {
  Button,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toPersianDigits } from "../../lib/weight/format";
import {
  getSelfTrackingMetric,
  PERSONAL_RECORD_TYPES,
  SELF_TRACKING_METRICS,
  type SelfTrackingMetricKey,
} from "../../lib/self-tracking-data";
import { athleteSelfTrackingScreenStyles as styles } from "./AthleteSelfTrackingScreen.styles";
import type { AthleteSelfTrackingScreenProps } from "./AthleteSelfTrackingScreen.types";

function localDateTimeValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AthleteSelfTrackingScreen({
  metrics,
  personalRecords,
  pending = false,
  personalRecordsEnabled = true,
  initialMetric = "water_ml",
  onCreateMetric,
  onDeleteMetric,
  onCreatePersonalRecord,
}: AthleteSelfTrackingScreenProps) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] =
    useState<SelfTrackingMetricKey>(initialMetric);
  const [value, setValue] = useState("");
  const [recordedAt, setRecordedAt] = useState(localDateTimeValue);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordType, setRecordType] = useState(PERSONAL_RECORD_TYPES[0].key);
  const [recordValue, setRecordValue] = useState("");
  const [recordDate, setRecordDate] = useState(localDateTimeValue);
  const selected = getSelfTrackingMetric(selectedKey)!;
  const selectedHistory = useMemo(
    () => metrics.filter((item) => item.metricKey === selectedKey).slice(0, 20),
    [metrics, selectedKey],
  );

  async function submitMetric() {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    setError(null);
    setMessage(null);
    try {
      await onCreateMetric({
        metricKey: selectedKey,
        value: parsed,
        recordedAt: new Date(recordedAt).toISOString(),
        unit: selected.unit,
        note: note.trim() || undefined,
      });
      setValue("");
      setNote("");
      setMessage(`${selected.label} با موفقیت ثبت شد.`);
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

  return (
    <AppLayout
      className={styles.root}
      header={
        <Header
          startContent={
            <Button
              aria-label="بازگشت"
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography type="h1" weight="bold">
            ثبت فعالیت و سلامت
          </Typography>
          <Typography className={styles.subtitle} type="body">
            آب، خواب، پیاده‌روی، وزن و رکوردهای ورزشی خودت را در یک تاریخچهٔ
            خصوصی نگه دار.
          </Typography>
        </section>

        <div className={styles.selector}>
          {SELF_TRACKING_METRICS.map((metric) => (
            <Button
              className={styles.metricButton}
              key={metric.key}
              onPress={() => {
                setSelectedKey(metric.key);
                setMessage(null);
                setError(null);
              }}
              variant={selectedKey === metric.key ? "primary" : "outline"}
            >
              {metric.label}
            </Button>
          ))}
        </div>

        <section className={styles.card}>
          <div>
            <Typography type="h3" weight="semibold">
              ثبت {selected.label}
            </Typography>
            <Typography className={styles.meta} type="body-sm">
              {selected.hint} · این داده به‌صورت پیش‌فرض خصوصی است.
            </Typography>
          </div>
          <div className={styles.form}>
            <TextField>
              <Label>مقدار ({selected.unitLabel})</Label>
              <Input
                inputMode="decimal"
                max={selected.max}
                min={selected.min}
                onChange={(event) => setValue(event.target.value)}
                step={selected.step}
                type="number"
                value={value}
              />
            </TextField>
            <div className={styles.grid}>
              <TextField>
                <Label>زمان ثبت</Label>
                <Input
                  onChange={(event) => setRecordedAt(event.target.value)}
                  type="datetime-local"
                  value={recordedAt}
                />
              </TextField>
              <TextField>
                <Label>یادداشت (اختیاری)</Label>
                <Input
                  onChange={(event) => setNote(event.target.value)}
                  value={note}
                />
              </TextField>
            </div>
            <Button
              fullWidth
              isDisabled={
                pending ||
                value.trim() === "" ||
                Number(value) < selected.min ||
                Number(value) > selected.max
              }
              onPress={() => void submitMetric()}
              variant="primary"
            >
              ثبت در تاریخچه
            </Button>
            {message ? <p className={styles.feedback}>{message}</p> : null}
            {error ? <p className={styles.error}>{error}</p> : null}
          </div>
        </section>

        <section className={styles.card}>
          <Typography type="h3" weight="semibold">
            تاریخچهٔ {selected.label}
          </Typography>
          {selectedHistory.length === 0 ? (
            <div className={styles.empty}>هنوز چیزی ثبت نشده است.</div>
          ) : (
            <div className={styles.history}>
              {selectedHistory.map((item) => (
                <article className={styles.historyRow} key={item.id}>
                  <div className={styles.historyCopy}>
                    <Typography type="body" weight="semibold">
                      {toPersianDigits(item.value)} {selected.unitLabel}
                    </Typography>
                    <Typography className={styles.meta} type="body-sm">
                      {formatDate(item.recordedAt)}
                    </Typography>
                  </div>
                  <Button
                    isDisabled={pending}
                    onPress={() => void onDeleteMetric(item.id)}
                    size="sm"
                    variant="ghost"
                  >
                    حذف
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>

        {personalRecordsEnabled ? (
          <section className={styles.card}>
            <div>
              <Typography type="h3" weight="semibold">
                رکورد شخصی
              </Typography>
              <Typography className={styles.meta} type="body-sm">
                بهترین عملکردهای ورزشی خودت را ثبت کن.
              </Typography>
            </div>
            <div className={styles.form}>
              <TextField>
                <Label>نوع رکورد</Label>
                <select
                  className={styles.nativeSelect}
                  onChange={(event) => setRecordType(event.target.value)}
                  value={recordType}
                >
                  {PERSONAL_RECORD_TYPES.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label} ({item.unit})
                    </option>
                  ))}
                </select>
              </TextField>
              <div className={styles.grid}>
                <TextField>
                  <Label>مقدار</Label>
                  <Input
                    inputMode="decimal"
                    min={0}
                    onChange={(event) => setRecordValue(event.target.value)}
                    type="number"
                    value={recordValue}
                  />
                </TextField>
                <TextField>
                  <Label>تاریخ رکورد</Label>
                  <Input
                    onChange={(event) => setRecordDate(event.target.value)}
                    type="datetime-local"
                    value={recordDate}
                  />
                </TextField>
              </div>
              <Button
                fullWidth
                isDisabled={pending || recordValue.trim() === ""}
                onPress={() => void submitPersonalRecord()}
                variant="secondary"
              >
                ثبت رکورد شخصی
              </Button>
              {personalRecords.length > 0 ? (
                <Typography className={styles.meta} type="body-sm">
                  {toPersianDigits(personalRecords.length)} رکورد در پروفایل خصوصی
                  شما ذخیره شده است.
                </Typography>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </AppLayout>
  );
}
