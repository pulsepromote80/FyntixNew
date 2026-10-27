"use client";

import type { TextareaHTMLAttributes } from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface FormTextareaProps<TFormValues extends FieldValues>
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name"> {
  name: Path<TFormValues>;
  label?: string;
}

export function FormTextarea<TFormValues extends FieldValues>({
  name,
  label,
  className,
  ...props
}: FormTextareaProps<TFormValues>) {
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
      <textarea
        id={name}
        className={cn(
          "min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          error ? "border-destructive" : "border-border",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...register(name)}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
