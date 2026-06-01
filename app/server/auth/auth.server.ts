import { betterAuth } from "better-auth";
import { eq } from "drizzle-orm";

import { db, pool } from "~/server/database/db.server";
import { user, userInvites } from "~/server/database/schema.server";
import { ROUTES } from "~/shared/constants";

export const auth = betterAuth({
  database: pool,
  user: {
    modelName: "user",
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    modelName: "session",
    fields: {
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      userId: "user_id",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  account: {
    modelName: "account",
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "verification",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  errorURL: `${ROUTES.login.path}?error=unauthorized`,
  onAPIError: {
    errorURL: `${ROUTES.login.path}?error=unauthorized`,
  },
  logger: {
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const result = await db
            .select({ email: user.email })
            .from(user)
            .where(eq(user.id, session.userId))
            .limit(1);
          const userEmail = result[0]?.email;
          if (!userEmail) return false;

          const inviteCheck = await db
            .select({ id: userInvites.id })
            .from(userInvites)
            .where(eq(userInvites.email, userEmail))
            .limit(1);
          if (inviteCheck.length === 0) return false;
        },
      },
    },
  },
});
