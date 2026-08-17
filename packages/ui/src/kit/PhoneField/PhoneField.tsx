"use client";

import { FieldError, Input, Label, TextField } from "@heroui/react";
import { phoneFieldVariants } from "./PhoneField.styles";
import type { PhoneFieldProps } from "./PhoneField.types";

export function PhoneField({
  value,
  label,
  placeholder,
  name = "phone",
  className,
  isInvalid = false,
  errorMessage,
  countryCode = "+۹۸",
  countryFlag = "🇮🇷",
  onChange,
  onBlur,
  inputRef,
}: PhoneFieldProps) {
  const styles = phoneFieldVariants({ isInvalid });

  return (
    <TextField
      className={styles.root({ className })}
      fullWidth
      isInvalid={isInvalid}
      isRequired
      name={name}
      type="tel"
      value={value}
      onBlur={onBlur}
      onChange={onChange}
    >
      <Label className={styles.label()}>{label}</Label>
      <div className={styles.field()}>
        <span aria-hidden className={styles.country()}>
          <span className={styles.countryFlag()}>{countryFlag}</span>
          <span className={styles.countryCode()}>{countryCode}</span>
        </span>
        <span aria-hidden className={styles.divider()} />
        <Input
          aria-label={label}
          autoComplete="tel"
          className={styles.input()}
          inputMode="tel"
          placeholder={placeholder}
          ref={inputRef}
        />
      </div>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </TextField>
  );
}
