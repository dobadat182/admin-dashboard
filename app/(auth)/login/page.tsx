import { Suspense } from "react";
import { LoginForm } from "@/modules/auth/components/login-form";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center" aria-busy>
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;
