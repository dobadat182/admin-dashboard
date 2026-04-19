// Create a forgot password form component
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForgotPassword } from "../hooks/useAuth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const { mutate: forgotPassword, isSuccess, isPending, data } = useForgotPassword();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    forgotPassword({ email: email as string });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message);
    }
  }, [isSuccess, data]);

  return (
    <Card className="mx-auto w-full max-w-xl overflow-hidden p-0">
      <CardContent>
        <form className="p-6 md:p-8" onSubmit={handleSubmit}>
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-muted-foreground text-balance">
              Don’t worry, it happens to the best of us. Enter your email and we'll send you a link
              to get back to your canvas.
            </p>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">EMAIL ADDRESS</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field>
              <Button type="submit" size="lg" className={cn("cursor-pointer", isPending && "cursor-not-allowed")} disabled={isPending}>
                {isPending ? "Sending..." : "Submit"}
                {isPending && <Loader2 className="ml-2 size-4 animate-spin" />}
              </Button>
            </Field>
          </FieldGroup>

          <p className="text-muted-foreground mt-6 text-center text-sm">
            Remember your password?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
