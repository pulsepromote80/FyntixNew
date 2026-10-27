"use client";

import { Search } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export function SearchInput({ className, ...props }: InputProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input type="search" className={cn("pl-9", className)} {...props} />
    </div>
  );
}
