import type { DateValue } from "@internationalized/date";
import { parseDate, parseDateTime } from "@internationalized/date";
import {
  Calendar,
  DateField,
  DatePicker,
  Description,
  FieldError,
  Label,
} from "@heroui/react";

type AdminDatePickerProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  description?: string;
  granularity?: "day" | "minute";
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
  labelClassName?: string;
};

function parseValue(value: string, granularity: "day" | "minute") {
  if (!value) return null;
  try {
    return granularity === "day"
      ? parseDate(value.slice(0, 10))
      : parseDateTime(value.slice(0, 16));
  } catch {
    return null;
  }
}

/** A single accessible date pattern for admin forms and filters. */
export function AdminDatePicker({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  description,
  granularity = "day",
  isRequired = false,
  isDisabled = false,
  className,
  labelClassName,
}: AdminDatePickerProps) {
  const selectedValue = parseValue(value, granularity);

  const handleChange = (nextValue: DateValue | null) => {
    if (!nextValue) {
      onChange("");
      return;
    }
    const serialized = nextValue.toString();
    onChange(granularity === "day" ? serialized.slice(0, 10) : serialized.slice(0, 16));
  };

  return (
    <DatePicker
      className={className}
      granularity={granularity}
      hourCycle={24}
      isDisabled={isDisabled}
      isInvalid={Boolean(error)}
      isRequired={isRequired}
      name={name}
      shouldForceLeadingZeros
      value={selectedValue}
      onBlur={onBlur}
      onChange={handleChange}
    >
      <Label className={labelClassName}>{label}</Label>
      <DateField.Group fullWidth>
        <DateField.Input>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger aria-label={`${label}؛ باز کردن تقویم`}>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      {description && !error ? <Description>{description}</Description> : null}
      <FieldError>{error}</FieldError>
      <DatePicker.Popover>
        <Calendar aria-label={label}>
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({ year }) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}
