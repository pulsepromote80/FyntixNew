import { RegistrationForm } from "@/features/auth/components/RegistrationForm";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function RegisterFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegistrationForm />
    </Suspense>
  );
}
