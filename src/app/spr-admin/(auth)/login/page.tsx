import { LoginForm } from "@/spr-admin/features/auth/components/LoginForm";
import { AdminThemeToggle } from "@/spr-admin/components/layout/AdminThemeToggle";

export default function LoginPage() {
  return (
    <div className="spr-admin-login relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f9ff] p-4 transition-colors sm:p-6">
      <div
        className="admin-login-glow admin-login-glow-center absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1680ff]/10 blur-[160px]"
      />
      <div
        className="admin-login-glow admin-login-glow-left absolute -left-32 top-1/4 h-[350px] w-[350px] rounded-full bg-[#25c6e8]/10 blur-[130px]"
      />
      <div
        className="admin-login-glow admin-login-glow-right absolute -right-32 bottom-1/4 h-[350px] w-[350px] rounded-full bg-[#7d75ff]/10 blur-[130px]"
      />
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <AdminThemeToggle />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}