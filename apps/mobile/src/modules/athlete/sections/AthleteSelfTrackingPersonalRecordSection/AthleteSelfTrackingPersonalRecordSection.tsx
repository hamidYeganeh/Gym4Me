import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { toPersianDigits } from "@/modules/athlete/lib/weight/format";
import { PERSONAL_RECORD_TYPES } from "@/modules/athlete/lib/self-tracking-data";
import { athleteSelfTrackingPersonalRecordSectionVariants } from "./AthleteSelfTrackingPersonalRecordSection.styles";
import type { AthleteSelfTrackingPersonalRecordSectionProps } from "./AthleteSelfTrackingPersonalRecordSection.types";

export function AthleteSelfTrackingPersonalRecordSection({
  recordType,
  recordValue,
  recordDate,
  pending = false,
  personalRecords,
  onRecordTypeChange,
  onRecordValueChange,
  onRecordDateChange,
  onSubmit,
  className,
}: AthleteSelfTrackingPersonalRecordSectionProps) {
  const styles = athleteSelfTrackingPersonalRecordSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div>
        <Typography type="h3" weight="semibold">
          رکورد شخصی
        </Typography>
        <Typography className={styles.meta()} type="body-sm">
          بهترین عملکردهای ورزشی خودت را ثبت کن.
        </Typography>
      </div>
      <div className={styles.form()}>
        <TextField>
          <Label>نوع رکورد</Label>
          <select
            className={styles.nativeSelect()}
            onChange={(event) => onRecordTypeChange(event.target.value)}
            value={recordType}
          >
            {PERSONAL_RECORD_TYPES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label} ({item.unit})
              </option>
            ))}
          </select>
        </TextField>
        <div className={styles.grid()}>
          <TextField>
            <Label>مقدار</Label>
            <Input
              inputMode="decimal"
              min={0}
              onChange={(event) => onRecordValueChange(event.target.value)}
              type="number"
              value={recordValue}
            />
          </TextField>
          <TextField>
            <Label>تاریخ رکورد</Label>
            <Input
              onChange={(event) => onRecordDateChange(event.target.value)}
              type="datetime-local"
              value={recordDate}
            />
          </TextField>
        </div>
        <Button size="lg"
          fullWidth
          isDisabled={pending || recordValue.trim() === ""}
          onPress={() => void onSubmit()}
          variant="secondary"
        >
          ثبت رکورد شخصی
        </Button>
        {personalRecords.length > 0 ? (
          <Typography className={styles.meta()} type="body-sm">
            {toPersianDigits(personalRecords.length)} رکورد در پروفایل خصوصی
            شما ذخیره شده است.
          </Typography>
        ) : null}
      </div>
    </section>
  );
}
