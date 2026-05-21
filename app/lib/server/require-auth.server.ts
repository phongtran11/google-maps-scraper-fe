import { redirect, createContext } from "react-router";
import { auth } from "~/lib/server/auth.server";
import { pool } from "~/lib/server/db.server";

export type SessionType = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export const sessionContext = createContext<SessionType>();

export async function requireAuth(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw redirect("/login");
  }

  const inviteCheck = await pool.query(
    `SELECT 1 FROM user_invites WHERE email = $1`,
    [session.user.email],
  );
  if (inviteCheck.rows.length === 0) {
    throw redirect("/login?error=unauthorized");
  }

  return session;
}
