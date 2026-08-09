import { TRPCError } from "@trpc/server";
import { adminProcedure } from "./trpc";
import { ENV } from "./env";

function normalizeEmail(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export const platformOwnerProcedure = adminProcedure.use(async ({ ctx, next }) => {
  const emailMatches = normalizeEmail(ctx.user.email) === ENV.ownerEmail;
  const openIdMatches = !ENV.ownerOpenId || ctx.user.openId === ENV.ownerOpenId;

  if (!emailMatches || !openIdMatches) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Platform owner access is restricted to the designated owner account.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
