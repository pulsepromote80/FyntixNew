export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-2 text-center">
        <h1 className="text-xl font-semibold text-foreground">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Form implementation follows the same pattern as{" "}
          <code>features/auth/components/LoginForm.tsx</code>, using{" "}
          <code>forgotPasswordSchema</code>.
        </p>
      </div>
    </div>
  );
}
