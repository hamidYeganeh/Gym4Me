export type MultiSelectFilterOption<TValue extends string = string> = {
  value: TValue;
  label: string;
};

export type MultiSelectFilterProps<TValue extends string = string> = {
  label: string;
  placeholder: string;
  options: readonly MultiSelectFilterOption<TValue>[];
  value: readonly TValue[];
  onChange: (value: TValue[]) => void;
  className?: string;
};
