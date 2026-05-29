import { redirect, createContext } from "react-router";
import { auth } from "~/lib/server/auth.server";
import { db } from "~/lib/server/database/db.server";
import { userInvites } from "~/lib/server/database/schema";
import { eq } from "drizzle-orm";
import { ROUTES } from "~/lib/routes";

export type SessionType = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

export const sessionContext = createContext<SessionType>();

export async function requireAuth(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw redirect(ROUTES.login.path);
  }

  const inviteCheck = await db
    .select({ id: userInvites.id })
    .from(userInvites)
    .where(eq(userInvites.email, session.user.email))
    .limit(1);

  if (inviteCheck.length === 0) {
    throw redirect(`${ROUTES.login.path}?error=unauthorized`);
  }

  return session;
}
