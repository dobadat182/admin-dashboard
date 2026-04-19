"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRegister } from "../hooks/useAuth";

type RegisterFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function parseRegisterForm(form: HTMLFormElement): RegisterFormValues {
  const formData = new FormData(form);

  return {
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
}

export function RegisterForm() {
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const values = parseRegisterForm(e.currentTarget);

    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    register(
      {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message ?? "Registration successful");
          router.push("/login");
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.message ?? err?.message ?? "Unable to register. Please try again.";
          toast.error(message);
        },
      },
    );
  };

  return (
    <Card className="w-full overflow-hidden p-0">
      <CardContent className="grid p-0 md:grid-cols-2">
        <form className="p-6 md:p-8" onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Create account</h1>
              <p className="text-muted-foreground text-balance">
                Fill in your details to start your collection journey.
              </p>
            </div>



            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="first_name">FIRST NAME</FieldLabel>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="First Name"
                  required
                  disabled={isPending}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="last_name">LAST NAME</FieldLabel>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Last Name"
                  required
                  disabled={isPending}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="email">EMAIL</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                required
                disabled={isPending}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">PASSWORD</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  className="pr-10"
                  required
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-3 inline-flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  disabled={isPending}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
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
                  placeholder="Confirm your password"
                  className="pr-10"
                  required
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-3 inline-flex items-center"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  aria-pressed={showConfirmPassword}
                  disabled={isPending}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <Field>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Sign up"
                )}
              </Button>
            </Field>

            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Log in
              </Link>
            </p>
          </FieldGroup>
        </form>

        <div className="bg-muted relative hidden md:block">
          <img
            src="/placeholder.svg"
            alt="Register visual"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </CardContent>
    </Card>
  );
}