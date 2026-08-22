import { Label } from "@heroui/react/label";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
import { adminFilterSelectVariants } from "./AdminFilterSelect.styles";
import type {
  AdminFilterSelectChangeValue,
  AdminFilterSelectProps,
} from "./AdminFilterSelect.types";

export function AdminFilterSelect({
  label,
  value,
  options,
  allLabel,
  allValue = "all",
  placeholder,
  isDisabled,
  className,
  onChange,
}: AdminFilterSelectProps) {
  const styles = adminFilterSelectVariants();

  return (
    <Select
      className={styles.root({ className })}
      isDisabled={isDisabled}
      placeholder={placeholder ?? label}
      value={value}
      onChange={(next: AdminFilterSelectChangeValue) => {
        onChange(String(next ?? allValue));
      }}
    >
      <Label className={styles.label()}>{label}</Label>
      <Select.Trigger className={styles.trigger()}>
        <Select.Value className={styles.value()} />
        <Select.Indicator className={styles.indicator()} />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {allLabel ? (
            <ListBox.Item id={allValue} textValue={allLabel}>
              {allLabel}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ) : null}
          {options.map((option) => (
            <ListBox.Item
              key={option.value}
              id={option.value}
              textValue={option.label}
            >
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
