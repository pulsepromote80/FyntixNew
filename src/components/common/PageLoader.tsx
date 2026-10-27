import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  className?: string;
}

export function PageLoader({ className }: PageLoaderProps) {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
      <Loader2 className="h-12 w-12 animate-spin text-[#f5c451]" aria-label="Loading" />
    </div>
  );
}
