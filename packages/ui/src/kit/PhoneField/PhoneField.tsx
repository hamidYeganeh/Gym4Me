"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  type FormEvent,
  type Ref,
} from "react";
import { FieldError, InputGroup, Label, TextField } from "@heroui/react";
import { ChevronDown } from "@repo/icons/ChevronDown";
import { Flag } from "@repo/ui/common/Flag";
import { phoneFieldVariants } from "./PhoneField.styles";
import type { PhoneFieldProps } from "./PhoneField.types";

const DEFAULT_COUNTRY_FLAG = <Flag code="IR" rounded size="lg" title="Iran" />;
const IR_MOBILE_NATIONAL_LENGTH = 10;

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    (ref as { current: T | null }).current = value;
  }
}

function toAsciiDigits(input: string) {
  return input
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\D/g, "");
}

function toNationalIranMobileDigits(input: string) {
  let digits = toAsciiDigits(input);

  if (digits.startsWith("0098") && digits.length > 4) {
    digits = digits.slice(4);
  } else if (digits.startsWith("98") && digits.length > 10) {
    digits = digits.slice(2);
  }

  while (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits.slice(0, IR_MOBILE_NATIONAL_LENGTH);
}

/** Groups a national mobile as `912 0000 000`. */
function formatIranMobileNational(input: string) {
  const digits = toNationalIranMobileDigits(input);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 7),
    digits.slice(7, 10),
  ].filter((part) => part.length > 0);
  return parts.join(" ");
}

function caretIndexAfterDigitCount(formatted: string, digitCount: number) {
  if (digitCount <= 0) return 0;

  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    const char = formatted[index];
    if (char === undefined || char < "0" || char > "9") continue;
    seen += 1;
    if (seen >= digitCount) return index + 1;
  }

  return formatted.length;
}

export function PhoneField({
  value,
  label,
  placeholder,
  name = "phone",
  className,
  isInvalid = false,
  errorMessage,
  hideLabel = false,
  countryCode = "+98",
  countryFlag = DEFAULT_COUNTRY_FLAG,
  showCountryChevron = false,
  onChange,
  onBlur,
  inputRef,
}: PhoneFieldProps) {
  const styles = phoneFieldVariants({ hideLabel });
  const inputNodeRef = useRef<HTMLInputElement | null>(null);
  const caretDigitCountRef = useRef<number | null>(null);
  const displayValue = formatIranMobileNational(value);

  useLayoutEffect(() => {
    const input = inputNodeRef.current;
    const digitCount = caretDigitCountRef.current;
    if (!input || digitCount === null) return;

    caretDigitCountRef.current = null;
    const caret = caretIndexAfterDigitCount(displayValue, digitCount);
    input.setSelectionRange(caret, caret);
  }, [displayValue]);

  const handleInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputNodeRef.current = node;
      setRef(inputRef, node);
    },
    [inputRef],
  );

  const handleInput = (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    caretDigitCountRef.current = toAsciiDigits(
      input.value.slice(0, input.selectionStart ?? input.value.length),
    ).length;
  };

  const handleChange = (next: string) => {
    const previousDigits = toNationalIranMobileDigits(value);
    let nextDigits = toNationalIranMobileDigits(next);
    let targetDigitCount = caretDigitCountRef.current;

    if (
      nextDigits === previousDigits &&
      next.length < displayValue.length
    ) {
      const deleteIndex = Math.max(0, (targetDigitCount ?? nextDigits.length) - 1);
      nextDigits =
        previousDigits.slice(0, deleteIndex) +
        previousDigits.slice(deleteIndex + 1);
      targetDigitCount = deleteIndex;
    }

    caretDigitCountRef.current = targetDigitCount;
    onChange(formatIranMobileNational(nextDigits));
  };

  return (
    <TextField
      className={styles.root({ className })}
      fullWidth
      isInvalid={isInvalid}
      isRequired
      name={name}
      type="tel"
      value={displayValue}
      onBlur={onBlur}
      onChange={handleChange}
    >
      <Label className={styles.label()}>{label}</Label>
      <InputGroup className={styles.group()} fullWidth>
        <InputGroup.Prefix className={styles.country()}>
          <span className={styles.countryFlag()}>{countryFlag}</span>
          {showCountryChevron ? (
            <ChevronDown className={styles.countryChevron()} size={14} />
          ) : null}
          <span aria-hidden className={styles.divider()} />
          <span className={styles.countryCode()}>{countryCode}</span>
        </InputGroup.Prefix>
        <InputGroup.Input
          aria-label={label}
          autoComplete="tel"
          className={styles.input()}
          dir="ltr"
          inputMode="numeric"
          placeholder={placeholder}
          ref={handleInputRef}
          onInput={handleInput}
        />
      </InputGroup>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </TextField>
  );
}
