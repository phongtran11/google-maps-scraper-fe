import { betterAuth } from "better-auth";
import { pool } from "~/lib/db.server";

export const auth = betterAuth({
  database: pool,
  errorURL: "/login?error=unauthorized",
  onAPIError: {
    errorURL: "/login?error=unauthorized",
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
          const result = await pool.query(
            `SELECT email FROM "user" WHERE id = $1`,
            [session.userId],
          );
          const userEmail: string | undefined = result.rows[0]?.email;
          if (!userEmail) return false;

          const inviteCheck = await pool.query(
            `SELECT 1 FROM user_invites WHERE email = $1`,
            [userEmail],
          );
          if (inviteCheck.rows.length === 0) return false;
        },
      },
    },
  },
});
