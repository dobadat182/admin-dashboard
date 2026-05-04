import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

// =========================================================
// Types
// =========================================================
export interface User {
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

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

// =========================================================
// Store
// refreshToken KHÔNG lưu ở đây vì backend dùng httpOnly cookie
// =========================================================
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,

        setAccessToken: (accessToken) =>
          set({ accessToken, isAuthenticated: true }, false, "setAccessToken"),

        setUser: (user) => set({ user }, false, "setUser"),

        clearAuth: () =>
          set({ user: null, accessToken: null, isAuthenticated: false }, false, "clearAuth"),
      }),
      {
        name: "auth-storage",
        // Chỉ persist accessToken — refresh token nằm trong httpOnly cookie
        partialize: (state) => ({ accessToken: state.accessToken }),
        onRehydrateStorage: () => (state) => {
          if (state?.accessToken) {
            state.isAuthenticated = true;
          }
        },
      },
    ),
    { name: "AuthStore" },
  ),
);
