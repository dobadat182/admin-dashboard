"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { AxiosError } from "axios";
import { useProfile } from "@/modules/auth/hooks/useAuth";
import { DEFAULT_LOGGED_IN_ROUTE, isPublicAuthRoute } from "@/lib/auth-paths";

// =========================================================
// Singleton QueryClient — tạo ngoài component tránh re-create
// =========================================================
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60, // 1 phút default
        retry: (failureCount, error) => {
          const axiosError = error as AxiosError;
          // Không retry lỗi 401 / 403
          if ([401, 403].includes(axiosError?.response?.status ?? 0)) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: luôn tạo mới
    return makeQueryClient();
  }
  // Client: tái sử dụng instance
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

// =========================================================
// AuthGuard — chỉ vào app khi có token; guest chỉ xem trang auth
// =========================================================
function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persistApi = useAuthStore.persist;
    if (!persistApi) {
      setHydrated(true);
      return;
    }
    if (persistApi.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return persistApi.onFinishHydration(() => setHydrated(true));
  }, []);

  const { data: profile, isSuccess, isError } = useProfile();

  // 1) Đồng bộ user vào global state khi profile query thành công
  useEffect(() => {
    if (isSuccess && profile) {
      setUser(profile);
    }
  }, [isSuccess, profile, setUser]);

  // 2) Nếu profile lỗi auth thì clear state
  useEffect(() => {
    if (isError) {
      clearAuth();
    }
  }, [isError, clearAuth]);

  // 3) Sau khi biết token từ storage: điều hướng guest / user
  useEffect(() => {
    if (!hydrated) return;

    const onPublicAuth = isPublicAuthRoute(pathname);

    if (!accessToken) {
      if (!onPublicAuth) {
        const next = pathname !== "/login" ? `?next=${encodeURIComponent(pathname)}` : "";
        router.replace(`/login${next}`);
      }
      return;
    }

    if (onPublicAuth) {
      router.replace(DEFAULT_LOGGED_IN_ROUTE);
      return;
    }

    if (pathname === "/") {
      router.replace(DEFAULT_LOGGED_IN_ROUTE);
    }
  }, [hydrated, accessToken, pathname, router]);

  if (!hydrated) {
    return (
      <div
        className="bg-background flex h-svh w-full items-center justify-center"
        role="status"
        aria-label="Loading session"
      >
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

// =========================================================
// QueryProvider
// =========================================================
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>{children}</AuthGuard>
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
