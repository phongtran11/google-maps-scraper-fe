import { betterAuth } from "better-auth";
import { pool, sql, setupDatabase } from "~/lib/server/database/db.server";
import { ROUTES } from "~/lib/routes";

export const auth = betterAuth({
  database: pool,
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
          await setupDatabase();
          const result = await sql.query(
            `SELECT email FROM "user" WHERE id = $1`,
            [session.userId],
          );
          const userEmail: string | undefined = result[0]?.email;
          if (!userEmail) return false;

          const inviteCheck = await sql.query(
            `SELECT 1 FROM user_invites WHERE email = $1`,
            [userEmail],
          );
          if (inviteCheck.length === 0) return false;
        },
      },
    },
  },
});
