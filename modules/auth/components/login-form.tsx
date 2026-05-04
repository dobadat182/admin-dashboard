"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLogin } from "../hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending, error, isSuccess } = useLogin();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(email, password);
    login({ email, password });
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-start gap-2">
                <h1 className="text-3xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground">
                  Please enter your details to access your collection.
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">EMAIL ADDRESS</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">PASSWORD</FieldLabel>
                  <Link
                    href="/password/forgot"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    placeholder="Enter your password"
                    className="pr-10"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => setPassword(e.target.value)}
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
                <Button
                  size="lg"
                  type="submit"
                  className={cn("cursor-pointer", isPending && "cursor-not-allowed")}
                  disabled={isPending}
                >
                  {isPending ? "Logging in..." : "Login"}
                  {isPending && <Loader2 className="ml-2 size-4 animate-spin" />}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card my-6">
                New to Nailbox ?
              </FieldSeparator>

              <Field>
                <Button size="lg" className={cn("cursor-pointer")}>
                  <Link href="/register">Create an account</Link>
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Login Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
