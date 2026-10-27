"use client";

import type { InputHTMLAttributes } from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import { Input } from "@/components/ui/Input";

export interface FormInputProps<TFormValues extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: Path<TFormValues>;
  label?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * React Hook Form-aware input. Must be rendered inside a <FormProvider>
 * (see feature form components for usage).
 */
export function FormInput<TFormValues extends FieldValues>({
  name,
  label,
  onChange,
  ...props
}: FormInputProps<TFormValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFormValues>();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Input
        id={name}
        error={Boolean(error)}
        {...register(name, {
          onChange: (e) => {
            if (onChange) {
              onChange(e);
            }
          },
        })}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
