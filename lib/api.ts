import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { useAuthStore } from "@/stores/authStore";

// =========================================================
// Types
// =========================================================
interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

// =========================================================
// Refresh queue — gom các request 401 trong khi đang refresh
// =========================================================
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

/** Các route chỉ dùng cookie / body — không gắn Bearer (tránh backend bỏ qua kiểm tra mật khẩu khi vẫn còn token cũ trong store). */
const PUBLIC_AUTH_URLS = [
  "/auth/login",
  "/auth/register",
  "/auth/password/forgot",
  "/auth/password/reset",
] as const;

function isPublicAuthRequestUrl(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.split("?")[0];
  return PUBLIC_AUTH_URLS.some((p) => path === p || path.endsWith(p));
}

// =========================================================
// Axios instance
// withCredentials: true → tự gửi httpOnly cookie (refresh token)
// =========================================================
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  withCredentials: true, // Bắt buộc để gửi httpOnly cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// REQUEST interceptor
// Đính access token vào Authorization header
// =========================================================
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // FormData + default Content-Type: application/json → axios sẽ stringify FormData sai.
    if (config.data instanceof FormData && config.headers) {
      config.headers.delete("Content-Type");
    }

    // Dùng .getState() — không phải hook, an toàn ngoài React tree
    const token = useAuthStore.getState().accessToken;

    if (token && config.headers && !isPublicAuthRequestUrl(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// =========================================================
// RESPONSE interceptor
// Xử lý 401 → refresh token → retry request gốc
// =========================================================
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Chỉ xử lý 401, bỏ qua nếu đã retry rồi
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 401 từ login/register/forgot/reset = sai thông tin, không phải hết hạn session — không gọi refresh
    if (isPublicAuthRequestUrl(originalRequest.url)) {
      return Promise.reject(error);
    }

    // ── Đang refresh: đưa request vào queue chờ ──────────
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // ── Bắt đầu refresh ──────────────────────────────────
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Dùng axios gốc (không phải instance) để tránh interceptor loop
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        undefined,
        { withCredentials: true },
      );

      const refreshPayload = data?.data ?? data;
      const newAccessToken: string | undefined =
        refreshPayload?.access_token ?? refreshPayload?.accessToken;

      if (!newAccessToken)
        throw new Error("Refresh response missing access token");

      // Cập nhật Zustand store
      useAuthStore.getState().setAccessToken(newAccessToken);
      // useAuthStore.getState().setUser(data.user);

      // Giải phóng tất cả request đang chờ trong queue
      processQueue(null, newAccessToken);

      // Retry request gốc với token mới
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Refresh thất bại → xóa auth, AuthGuard sẽ redirect về login
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
