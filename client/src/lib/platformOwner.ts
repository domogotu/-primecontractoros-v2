export const PLATFORM_OWNER_EMAIL = "dominiquereed35@gmail.com";

export function isPlatformOwner(user: { email?: string | null } | null | undefined): boolean {
  return user?.email?.trim().toLowerCase() === PLATFORM_OWNER_EMAIL;
}
