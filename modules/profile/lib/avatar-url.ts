/** Chuẩn hóa URL avatar từ API (absolute hoặc path tương đối base API). */
export function resolveAvatarUrl(avatar: string | null | undefined): string | undefined {
  if (!avatar) return undefined;
  if (/^https?:\/\//i.test(avatar)) return avatar;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const path = avatar.startsWith("/") ? avatar : `/${avatar}`;
  return base ? `${base}${path}` : path;
}
