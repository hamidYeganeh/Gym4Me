"use client";

import { FieldError, Input, Label, TextField } from "@heroui/react";
import { authPhoneFieldVariants } from "./AuthPhoneField.styles";
import type { AuthPhoneFieldProps } from "./AuthPhoneField.types";

export function AuthPhoneField({
  value,
  label,
  placeholder,
  name = "phone",
  className,
  isInvalid = false,
  errorMessage,
  onChange,
  onBlur,
  inputRef,
}: AuthPhoneFieldProps) {
  const styles = authPhoneFieldVariants();

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
          <span className={styles.countryFlag()}>🇮🇷</span>
          <span className={styles.countryCode()}>+۹۸</span>
        </span>
        <span aria-hidden className={styles.divider()} />
        <Input
          aria-label={label}
          autoComplete="tel"
          // className={styles.input()}
          inputMode="tel"
          placeholder={placeholder}
          ref={inputRef}
        />
      </div>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </TextField>
  );
}
