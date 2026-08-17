"use client";

import { useState } from "react";
import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { Eye } from "@repo/icons/Eye";
import { EyeSlash } from "@repo/icons/EyeSlash";
import { Lock1 } from "@repo/icons/Lock1";
import { passwordFieldVariants } from "./PasswordField.styles";
import type { PasswordFieldProps } from "./PasswordField.types";

export function PasswordField({
  value,
  label,
  placeholder,
  name,
  className,
  isInvalid = false,
  isRequired = false,
  errorMessage,
  autoComplete = "current-password",
  showPasswordLabel,
  hidePasswordLabel,
  onChange,
  onBlur,
  inputRef,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const styles = passwordFieldVariants({ isInvalid });

  return (
    <TextField
      className={styles.root({ className })}
      fullWidth
      isInvalid={isInvalid}
      isRequired={isRequired}
      name={name}
      type={showPassword ? "text" : "password"}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
    >
      <Label className={styles.label()}>{label}</Label>
      <div className={styles.inputWrap()}>
        <Lock1 className={styles.inputIcon()} size={22} />
        <Input
          autoComplete={autoComplete}
          className={`${styles.input()} ${styles.inputWithSuffix()}`}
          dir="ltr"
          placeholder={placeholder}
          ref={inputRef}
        />
        <Button
          aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
          className={styles.suffixButton()}
          isIconOnly
          size="lg"
          type="button"
          variant="ghost"
          onPress={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeSlash size={22} /> : <Eye size={22} />}
        </Button>
      </div>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </TextField>
  );
}
