"use client";

import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/types/common";

export interface FormSelectProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function FormSelect<TFormValues extends FieldValues>({
  name,
  label,
  options,
  placeholder,
}: FormSelectProps<TFormValues>) {
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
      <Select id={name} error={Boolean(error)} options={options} placeholder={placeholder} {...register(name)} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
