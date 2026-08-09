export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
};

const REQUIRED_PRODUCTION_ENV: Array<[string, string]> = [
  ["DATABASE_URL", ENV.databaseUrl],
  ["JWT_SECRET", ENV.cookieSecret],
  ["VITE_APP_ID", ENV.appId],
  ["OAUTH_SERVER_URL", ENV.oAuthServerUrl],
];

export function validateProductionCoreEnv() {
  if (!ENV.isProduction) return;

  const missing = REQUIRED_PRODUCTION_ENV
    .filter(([, value]) => !value.trim())
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`
    );
  }

  if (ENV.cookieSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production.");
  }

  try {
    const oauthUrl = new URL(ENV.oAuthServerUrl);
    if (oauthUrl.protocol !== "https:") {
      throw new Error("OAUTH_SERVER_URL must use HTTPS in production.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("must use HTTPS")) throw error;
    throw new Error("OAUTH_SERVER_URL must be a valid absolute HTTPS URL in production.");
  }
}
