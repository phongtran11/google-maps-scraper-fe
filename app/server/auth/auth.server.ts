import { betterAuth } from "better-auth";
import { eq } from "drizzle-orm";

import { db, pool } from "~/server/database/db.server";
import { user, userInvites } from "~/server/database/schema.server";
import { ROUTES } from "~/shared/constants";

export const auth = betterAuth({
  account: {
    fields: {
      accessToken: "access_token",
      accessTokenExpiresAt: "access_token_expires_at",
      accountId: "account_id",
      createdAt: "created_at",
      idToken: "id_token",
      providerId: "provider_id",
      refreshToken: "refresh_token",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      updatedAt: "updated_at",
      userId: "user_id",
    },
    modelName: "account",
  },
  database: pool,
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
  errorURL: `${ROUTES.login.path}?error=unauthorized`,
  logger: {
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
  },
  onAPIError: {
    errorURL: `${ROUTES.login.path}?error=unauthorized`,
  },
  session: {
    fields: {
      createdAt: "created_at",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      updatedAt: "updated_at",
      userAgent: "user_agent",
      userId: "user_id",
    },
    modelName: "session",
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  user: {
    fields: {
      createdAt: "created_at",
      emailVerified: "email_verified",
      updatedAt: "updated_at",
    },
    modelName: "user",
  },
  verification: {
    fields: {
      createdAt: "created_at",
      expiresAt: "expires_at",
      updatedAt: "updated_at",
    },
    modelName: "verification",
  },
});
