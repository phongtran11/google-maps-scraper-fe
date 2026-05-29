import { betterAuth } from "better-auth";
import { pool, db } from "~/lib/server/database/db.server";
import { user, userInvites } from "~/lib/server/database/schema";
import { eq } from "drizzle-orm";
import { ROUTES } from "~/lib/routes";

export const auth = betterAuth({
  database: pool,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
    "https://google-maps-scraper-fe-production.up.railway.app"
  ].filter(Boolean),
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
        before: async (session: any) => {
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
