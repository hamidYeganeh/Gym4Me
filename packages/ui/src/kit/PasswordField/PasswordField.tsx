"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { FieldError } from "@heroui/react/field-error";
import { InputGroup } from "@heroui/react/input-group";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Eye } from "@repo/icons/Eye";
import { EyeSlash } from "@repo/icons/EyeSlash";
import { Lock1 } from "@repo/icons/Lock1";
import { browserAutofillOffProps } from "@repo/theme";
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
  autoComplete = browserAutofillOffProps.autoComplete,
  hideLabel = false,
  showPasswordLabel,
  hidePasswordLabel,
  onChange,
  onBlur,
  inputRef,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [suppressAutofill, setSuppressAutofill] = useState(true);
  const styles = passwordFieldVariants({ hideLabel });
  const unlockAutofill = () => setSuppressAutofill(false);

  return (
    <TextField
      autoComplete={autoComplete}
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
      <InputGroup className={styles.group()} fullWidth>
        <InputGroup.Prefix>
          <Lock1 className={styles.prefixIcon()} size={22} />
        </InputGroup.Prefix>
        <InputGroup.Input
          {...browserAutofillOffProps}
          aria-label={label}
          autoComplete={autoComplete}
          className={styles.input()}
          dir="ltr"
          placeholder={placeholder}
          readOnly={suppressAutofill}
          ref={inputRef}
          onFocus={unlockAutofill}
          onPointerDown={unlockAutofill}
        />
        <InputGroup.Suffix>
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
        </InputGroup.Suffix>
      </InputGroup>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </TextField>
  );
}
