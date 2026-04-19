"use client";

import { useEffect, useRef, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile, useUpdateProfile } from "@/modules/auth/hooks/useAuth";
import { resolveAvatarUrl } from "@/modules/profile/lib/avatar-url";
import { cn } from "@/lib/utils";
import {
  IconCamera,
  IconClock,
  IconMail,
  IconTrash,
  IconUser,
  IconShieldCheck,
  IconShieldX,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function formatDate(value: Date | string | null | undefined): string {
  if (value == null) return "—";
  const dt = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function MetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 py-3 first:pt-0 last:pb-0 not-last:border-b not-last:border-border/60">
      <div className="bg-muted/80 text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
        <div className="text-foreground text-sm">{children}</div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile, isPending, isError, error, refetch } = useProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const d = profile?.data;

  useEffect(() => {
    if (!d) return;
    setFirstName(d.first_name);
    setLastName(d.last_name);
    setAvatarFile(null);
    setRemoveAvatar(false);
    setAvatarPreview(null);
  }, [d?.id, d?.first_name, d?.last_name, d?.avatar]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const displayAvatar =
    avatarPreview ?? (removeAvatar ? undefined : resolveAvatarUrl(d?.avatar ?? null));

  const initials =
    d?.full_name
      ?.split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }
    setRemoveAvatar(false);
    setAvatarFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!d) return;
    updateProfile(
      {
        first_name: firstName.trim() || d.first_name,
        last_name: lastName.trim() || d.last_name,
        avatarFile: removeAvatar ? undefined : avatarFile ?? undefined,
        clearAvatar: removeAvatar,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated.");
          setAvatarFile(null);
          setRemoveAvatar(false);
        },
        onError: (err) => {
          toast.error(err.response?.data?.message ?? "Could not update profile.");
        },
      },
    );
  };

  const dirty =
    !!avatarFile ||
    removeAvatar ||
    (d && (firstName.trim() !== d.first_name || lastName.trim() !== d.last_name));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <header className="bg-card flex h-14 shrink-0 items-center rounded-xl border border-border/80 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-center gap-2 px-3 sm:px-4">
          <SidebarTrigger className="-ml-0.5" />
          <Separator
            orientation="vertical"
            className="data-vertical:h-4 data-vertical:self-auto mr-1 h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:inline-flex">
                <BreadcrumbLink href="/dashboard" className="text-muted-foreground">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:inline-flex" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 pb-8">
        {isPending && (
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-8">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-56 w-full rounded-xl" />
              </div>
              <Skeleton className="h-72 w-full rounded-xl lg:col-span-4" />
            </div>
          </div>
        )}

        {isError && (
          <Card className="border-destructive/20 bg-card/80 max-w-lg shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Could not load profile</CardTitle>
              <CardDescription>
                {error?.response?.data?.message ?? error?.message ?? "Something went wrong."}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button type="button" variant="secondary" onClick={() => refetch()}>
                Try again
              </Button>
            </CardFooter>
          </Card>
        )}

        {!isPending && !isError && d && (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Hero */}
            <div className="border-border/80 from-primary/[0.07] via-card to-card relative overflow-hidden rounded-2xl border bg-linear-to-br shadow-sm ring-1 ring-black/5 dark:from-primary/10 dark:ring-white/10">
              <div
                className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl"
                aria-hidden
              />
              <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
                <div className="flex flex-col items-center gap-4 sm:items-start">
                  <div className="relative">
                    <Avatar className="border-background size-28 rounded-2xl border-4 shadow-lg ring-2 ring-primary/20 sm:size-32 overflow-hidden">
                      <AvatarImage src={displayAvatar} alt={d.full_name} className="rounded-none border-none shadow-none object-cover" />
                      <AvatarFallback className="rounded-none border-none shadow-none text-2xl font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-2 sm:justify-start">
                    <Button type="button" variant="secondary" size="sm" className="gap-2 shadow-sm" onClick={handlePickFile}>
                      <IconCamera className="size-4" />
                      Change photo
                    </Button>
                    {(d.avatar || avatarFile) && !removeAvatar && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 gap-2 border-destructive/30"
                        onClick={() => {
                          setAvatarFile(null);
                          setRemoveAvatar(true);
                        }}
                      >
                        <IconTrash className="size-4" />
                        Remove
                      </Button>
                    )}
                    {removeAvatar && !avatarFile && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setRemoveAvatar(false)}>
                        Undo remove
                      </Button>
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                      Your profile
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{d.full_name}</h1>
                    <p className="text-muted-foreground text-sm">{d.email}</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                    {d.roles?.length ? (
                      d.roles.map((role) => (
                        <span
                          key={role}
                          className="bg-primary/10 text-primary border-primary/15 inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium"
                        >
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs">No roles assigned</span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        d.email_verified_at
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300",
                      )}
                    >
                      {d.email_verified_at ? (
                        <>
                          <IconShieldCheck className="size-3.5" />
                          Verified
                        </>
                      ) : (
                        <>
                          <IconShieldX className="size-3.5" />
                          Unverified
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-muted-foreground max-w-md text-xs sm:text-sm">
                    JPG, PNG, WebP or GIF · max 5 MB. Photo and name changes are saved together below.
                  </p>
                </div>
              </div>

              {removeAvatar && (
                <div className="border-t border-amber-500/20 bg-amber-500/5 px-6 py-3 text-center text-xs text-amber-900 sm:text-left dark:text-amber-200">
                  Your profile photo will be removed when you save changes.
                </div>
              )}
            </div>

            <div className="grid items-stretch gap-6 lg:grid-cols-12">
              <div className="flex flex-col gap-6 lg:col-span-8">
                <Card className="border-border/80 overflow-hidden shadow-sm ring-1 ring-black/5 dark:ring-white/10 h-full">
                  <CardHeader className="border-b border-border/60 bg-muted/30">
                    <CardTitle className="flex items-center gap-2 text-base">
                      Personal information
                    </CardTitle>
                    <CardDescription>First and last name shown across the admin.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <FieldGroup>
                      <Field orientation="responsive">
                        <FieldLabel htmlFor="first_name">First name</FieldLabel>
                        <Input
                          id="first_name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          autoComplete="given-name"
                          className="bg-background"
                          required
                        />
                      </Field>
                      <Field orientation="responsive">
                        <FieldLabel htmlFor="last_name">Last name</FieldLabel>
                        <Input
                          id="last_name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          autoComplete="family-name"
                          className="bg-background"
                          required
                        />
                      </Field>
                    </FieldGroup>
                  </CardContent>
                  <CardFooter className="bg-muted/20 flex flex-col gap-3 border-t border-border/60 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground text-xs">
                      {dirty ? "You have unsaved changes." : "All changes saved."}
                    </p>
                    <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSaving || !dirty}
                        onClick={() => {
                          setFirstName(d.first_name);
                          setLastName(d.last_name);
                          setAvatarFile(null);
                          setRemoveAvatar(false);
                        }}
                      >
                        Reset
                      </Button>
                      <Button type="submit" disabled={isSaving || !dirty} className="min-w-34 gap-2">
                        {isSaving ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          "Save changes"
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>

              <Card className="border-border/80 h-fit overflow-hidden shadow-sm ring-1 ring-black/5 lg:col-span-4 dark:ring-white/10">
                <CardHeader className="border-b border-border/60 bg-muted/30">
                  <CardTitle className="text-base">Account</CardTitle>
                  <CardDescription>Read-only details from your workspace.</CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-2 sm:px-6">
                  <MetaRow icon={IconMail} label="Email">
                    <span className="break-all font-medium">{d.email}</span>
                    <p className="text-muted-foreground mt-1 text-xs">Contact support to change your email.</p>
                  </MetaRow>
                  <MetaRow icon={IconClock} label="Last sign-in">
                    {formatDate(d.last_login_at)}
                  </MetaRow>
                  <MetaRow icon={d.email_verified_at ? IconShieldCheck : IconShieldX} label="Email status">
                    {d.email_verified_at ? (
                      <span className="text-emerald-700 dark:text-emerald-400">
                        Verified · {formatDate(d.email_verified_at)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not verified</span>
                    )}
                  </MetaRow>
                </CardContent>
              </Card>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
