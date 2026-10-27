"use client";

import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import { Input } from "@/components/ui/Input";

export interface FormDatePickerProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label?: string;
}

/**
 * Minimal native <input type="date"> wrapper. Swap the input for a richer
 * date-picker library later without changing the call sites.
 */
export function FormDatePicker<TFormValues extends FieldValues>({
  name,
  label,
}: FormDatePickerProps<TFormValues>) {
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
      <Input id={name} type="date" error={Boolean(error)} {...register(name)} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
