"use client";

import { useAuthStore } from "@/stores/authStore";

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <>
      <h1 className="mb-4 text-9xl font-bol">Home</h1>
      <p className="text-muted-foreground text-lg">Starter homepage – chưa cấu hình đăng nhập.</p>
      {isAuthenticated ? (
        <p className="mt-4 text-sm font-medium text-green-600">Dang nhap thanh cong.</p>
      ) : null}
    </>
  );
}
