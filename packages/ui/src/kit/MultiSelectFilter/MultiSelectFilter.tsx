"use client";

import type { Key } from "react";
import { Label, ListBox, Select } from "@heroui/react";
import { multiSelectFilterVariants } from "./MultiSelectFilter.styles";
import type { MultiSelectFilterProps } from "./MultiSelectFilter.types";

export function MultiSelectFilter<TValue extends string>({
  label,
  placeholder,
  options,
  value,
  onChange,
  className,
}: MultiSelectFilterProps<TValue>) {
  const styles = multiSelectFilterVariants();

  return (
    <Select
      className={styles.root({ className })}
      placeholder={placeholder}
      selectionMode="multiple"
      value={value}
      onChange={(keys: Key[]) => onChange(keys.map(String) as TValue[])}
    >
      <Label className={styles.label()}>{label}</Label>
      <Select.Trigger className={styles.trigger()}>
        <Select.Value className={styles.value()} />
        <Select.Indicator className={styles.indicator()} />
      </Select.Trigger>
      <Select.Popover className={styles.popover()}>
        <ListBox className={styles.listBox()} selectionMode="multiple">
          {options.map((option) => (
            <ListBox.Item
              key={option.value}
              className={styles.item()}
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
