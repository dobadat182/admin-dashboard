// Create a forgot password form component
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useResetPassword } from "../hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const RESET_CREDS_KEY = "auth:password-reset";

function readStoredResetCreds(): { token: string; email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RESET_CREDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string; email?: string };
    if (parsed?.token && parsed?.email) return { token: parsed.token, email: parsed.email };
  } catch {
    /* ignore */
  }
  return null;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const { mutate: resetPassword, isPending } = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /** Tránh strip URL hai lần */
  const strippedRef = useRef(false);

  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");
  const storedCreds = readStoredResetCreds();
  const token = tokenFromUrl ?? storedCreds?.token ?? null;
  const email = emailFromUrl ?? storedCreds?.email ?? null;

  useEffect(() => {
    if (strippedRef.current) return;
    if (!tokenFromUrl || !emailFromUrl) return;
    strippedRef.current = true;
    const creds = { token: tokenFromUrl, email: emailFromUrl };
    try {
      sessionStorage.setItem(RESET_CREDS_KEY, JSON.stringify(creds));
    } catch {
      /* ignore quota / private mode */
    }
    router.replace("/password/reset", { scroll: false });
  }, [router, tokenFromUrl, emailFromUrl]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token || !email) {
      toast.error("Invalid or expired reset link.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    resetPassword(
      {
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      },
      {
        onSuccess: (res) => {
          try {
            sessionStorage.removeItem(RESET_CREDS_KEY);
          } catch {
            /* ignore */
          }
          toast.success(res?.message ?? "Password updated.");
          router.push("/login");
        },
        onError: (err) => {
          const message =
            err.response?.data?.message ??
            (typeof err.response?.data === "object" &&
              err.response?.data &&
              "message" in err.response.data
              ? String((err.response.data as { message?: string }).message)
              : null) ??
            err.message ??
            "Could not reset password.";
          toast.error(message);
        },
      },
    );
  };
  return (
    <Card className="mx-auto w-full max-w-xl overflow-hidden p-0">
      <CardContent>
        <form className="p-6 md:p-8" onSubmit={handleSubmit}>
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground text-balance">
              Enter your new password to reset your account.
            </p>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">NEW PASSWORD</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  required
                />
                <div className="absolute inset-y-0 right-3 inline-flex items-center">
                  <Button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    className={cn(
                      "text-muted-foreground hover:text-foreground m-0 cursor-pointer border-none bg-transparent p-0 hover:bg-transparent",
                      showPassword && "text-primary",
                    )}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">CONFIRM PASSWORD</FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPending}
                  required
                />
                <div className="absolute inset-y-0 right-3 inline-flex items-center">
                  <Button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    variant="ghost"
                    className={cn(
                      "text-muted-foreground hover:text-foreground m-0 cursor-pointer border-none bg-transparent p-0 hover:bg-transparent",
                      showConfirmPassword && "text-primary",
                    )}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Field>

            <Field>
              <Button type="submit" size="lg" className="cursor-pointer" disabled={isPending}>
                Submit
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
