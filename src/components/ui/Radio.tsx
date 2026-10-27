import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label htmlFor={id} className="inline-flex items-center gap-2 text-sm text-foreground">
        <input
          ref={ref}
          id={id}
          type="radio"
          className={cn(
            "h-4 w-4 border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            className,
          )}
          {...props}
        />
        {label}
      </label>
    );
  },
);

Radio.displayName = "Radio";
