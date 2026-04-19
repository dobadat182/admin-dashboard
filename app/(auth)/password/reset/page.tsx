import { Suspense } from "react";
import { ResetPasswordForm } from "@/modules/auth/components/reset-form";

function ResetPasswordFallback() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-lg border p-8 text-center text-muted-foreground">
      Loading…
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}