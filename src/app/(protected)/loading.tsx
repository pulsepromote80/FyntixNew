import { Loader2 } from "lucide-react";

export default function ProtectedLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-amber-400/20" />
        <span className="absolute inset-1 rounded-full border-t-2 border-[#F5C451] animate-spin" />
        <Loader2 className="h-8 w-8 animate-spin text-[#F5C451]" aria-hidden />
      </div>
    </div>
  );
}
