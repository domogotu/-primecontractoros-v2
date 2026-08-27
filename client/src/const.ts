export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const warmServer = async (): Promise<void> => {
  try {
    await fetch("/api/health", { method: "GET" });
  } catch {
    // Best-effort health warm-up.
  }
};

export const getLoginUrl = (returnPath?: string) => {
  const path = returnPath && returnPath.startsWith("/") ? returnPath : "/app/dashboard";
  return `/login?returnPath=${encodeURIComponent(path)}`;
};

export const navigateToLogin = async (returnPath?: string): Promise<void> => {
  await warmServer();
  window.location.href = getLoginUrl(returnPath);
};
