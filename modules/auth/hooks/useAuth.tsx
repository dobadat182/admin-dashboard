import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api";
import { DEFAULT_LOGGED_IN_ROUTE, hasAdminRole, safePostLoginPath } from "@/lib/auth-paths";
import { useAuthStore, User } from "@/stores/authStore";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

// =========================================================
// Types
// =========================================================
interface ApiError {
  message: string;
  statusCode: number;
}

interface LoginCredentials {
  email: string;
  password: string;
  /** Query `next` sau đăng nhập an toàn (path nội bộ). */
  redirectTo?: string | null;
}

interface LoginResponse {
  data: {
    access_token: string;
    refresh_token: string;
  };
  user: User;
}

interface RegisterCredentials {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    avatar: string | null;
    status: string;
    email_verified_at: Date | null;
    roles: string[];
    last_login_at: Date;
  };
}

interface ForgotPasswordCredentials {
  email: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data: null | undefined;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data: null | undefined;
}

// =========================================================
// Query Keys — centralize để dễ invalidate
// =========================================================
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

const ADMIN_LOGIN_FORBIDDEN_MESSAGE = "Chỉ tài khoản admin mới được đăng nhập vào hệ thống.";

async function revokeSessionAfterNonAdminLogin(accessToken: string): Promise<void> {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  } catch {
    // Bỏ qua — vẫn chặn đăng nhập phía client
  }
}

async function assertAdminCanUseDashboard(data: LoginResponse): Promise<void> {
  const roles = data.user?.data?.roles;
  if (hasAdminRole(roles)) return;

  await revokeSessionAfterNonAdminLogin(data.data.access_token);

  throw new AxiosError<ApiError>(ADMIN_LOGIN_FORBIDDEN_MESSAGE, "403", undefined, undefined, {
    status: 403,
    statusText: "Forbidden",
    data: { message: ADMIN_LOGIN_FORBIDDEN_MESSAGE, statusCode: 403 },
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  });
}

export interface UpdateProfileInput {
  first_name: string;
  last_name: string;
  /** Upload qua `POST /profile/avatar` (multipart, field `avatar`). */
  avatarFile?: File | null;
  /** Xóa qua `DELETE /profile/avatar`. */
  clearAvatar?: boolean;
}

// =========================================================
// useProfile — fetch thông tin user hiện tại
// =========================================================
export function useProfile(): UseQueryResult<User, AxiosError<ApiError>> {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<User>("/auth/profile");
      return data;
    },
    enabled: !!accessToken, // Chỉ fetch khi có token
    staleTime: 1000 * 60 * 5, // Cache 5 phút
    retry: false, // Không retry khi 401/403
  });
}

// =========================================================
// useUpdateProfile — avatar: POST/DELETE /profile/avatar; tên: POST /auth/profile (JSON)
// =========================================================
export function useUpdateProfile(): UseMutationResult<
  User,
  AxiosError<ApiError>,
  UpdateProfileInput
> {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async ({ first_name, last_name, avatarFile, clearAvatar }: UpdateProfileInput) => {
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await axiosInstance.post("/profile/avatar", fd);
      } else if (clearAvatar) {
        await axiosInstance.delete("/profile/avatar");
      }

      const { data } = await axiosInstance.post<User>("/auth/profile", {
        first_name,
        last_name,
      });
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.profile(), user);
      setUser(user);
    },
  });
}

// =========================================================
// useLogin
// =========================================================
export function useLogin(): UseMutationResult<
  LoginResponse,
  AxiosError<ApiError>,
  LoginCredentials
> {
  const { setAccessToken, setUser, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // Login dùng axios gốc để không bị interceptor refresh/attach Bearer can thiệp.
      const loginUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;

      // Tránh mang state phiên cũ vào request login mới.
      clearAuth();

      let data: LoginResponse;
      try {
        const res = await axios.post<LoginResponse>(loginUrl, credentials);
        data = res.data;
      } catch (err) {
        const axiosErr = err as AxiosError<ApiError>;

        // Một số backend set cookie bootstrap ở lần đầu rồi mới cho login lần sau.
        if (axiosErr.response?.status === 401) {
          const res = await axios.post<LoginResponse>(loginUrl, credentials, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          });
          data = res.data;
        } else {
          throw err;
        }
      }

      await assertAdminCanUseDashboard(data);
      return data;
    },
    onError: (error) => {
      const msg = axios.isAxiosError(error as any)
        ? ((error.response?.data as ApiError | undefined)?.message ?? error.message)
        : error instanceof Error
          ? error.message
          : "Đăng nhập thất bại";
      toast.error(msg);
    },
    onSuccess: (data) => {
      // Backend set httpOnly cookie refresh token qua Set-Cookie header tự động
      // Chỉ cần lưu accessToken vào Zustand
      setAccessToken(data.data.access_token);
      setUser(data.user);

      // Seed cache — không cần gọi /auth/me thêm lần nữa
      queryClient.setQueryData(authKeys.profile(), data.user);

      router.push("/");
    },
  });
}

// =========================================================
// useLogout
// =========================================================
export function useLogout(): UseMutationResult<void, AxiosError<ApiError>, void> {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // Gọi logout để backend xóa httpOnly cookie phía server
      await axiosInstance.post("/auth/logout");
    },
    onSettled: () => {
      // Dù thành công hay thất bại vẫn clear local state
      clearAuth();
      queryClient.clear(); // Xóa toàn bộ cache tránh data leak
      router.push("/login");
    },
  });
}

// =========================================================
// useRegister
// =========================================================
export function useRegister(): UseMutationResult<
  RegisterResponse,
  AxiosError<ApiError>,
  RegisterCredentials
> {
  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const { data } = await axiosInstance.post<RegisterResponse>("/auth/register", credentials);
      return data;
    },
  });
}

// =========================================================
// useForgotPassword
// =========================================================
export function useForgotPassword(): UseMutationResult<
  ForgotPasswordResponse,
  AxiosError<ApiError>,
  ForgotPasswordCredentials
> {
  return useMutation({
    mutationFn: async (credentials: ForgotPasswordCredentials) => {
      const { data } = await axiosInstance.post<ForgotPasswordResponse>(
        "/auth/password/forgot",
        credentials,
      );
      return data;
    },
  });
}

// =========================================================
// useResetPassword
// =========================================================
export function useResetPassword(): UseMutationResult<
  ResetPasswordResponse,
  AxiosError<ApiError>,
  {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }
> {
  return useMutation({
    mutationFn: async (credentials: {
      token: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => {
      const { data } = await axiosInstance.post<ResetPasswordResponse>("/auth/password/reset", {
        token: credentials.token,
        email: credentials.email,
        password: credentials.password,
        password_confirmation: credentials.password_confirmation,
      });
      return data;
    },
  });
}
