import type { Key } from "react";
import {
  Autocomplete,
  Description,
  Label,
  ListBox,
  SearchField,
  useFilter,
} from "@heroui/react";
import type { SportNode } from "@repo/api";

type Props = {
  label: string;
  description?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: SportNode[];
  value: string[];
  isLoading?: boolean;
  onChange: (value: string[]) => void;
};

export function DiscoverySportAutocomplete({
  label,
  description,
  placeholder = "ورزش‌ها را انتخاب کنید",
  searchPlaceholder = "جست‌وجوی ورزش…",
  options,
  value,
  isLoading = false,
  onChange,
}: Props) {
  const { contains } = useFilter({ sensitivity: "base" });

  return (
    <Autocomplete
      fullWidth
      isDisabled={isLoading}
      placeholder={isLoading ? "در حال دریافت ورزش‌ها…" : placeholder}
      selectionMode="multiple"
      value={value}
      variant="secondary"
      onChange={(keys: Key[]) => onChange(keys.map(String))}
      onClear={() => onChange([])}
    >
      <Label>{label}</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      {description ? <Description>{description}</Description> : null}
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus fullWidth>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder={searchPlaceholder} />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox selectionMode="multiple">
            {options.map((sport) => (
              <ListBox.Item id={sport.id} key={sport.id} textValue={sport.name}>
                <span className="min-w-0 flex-1 truncate">{sport.name}</span>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
