import { eq } from "drizzle-orm";
import { createContext, redirect } from "react-router";

import { auth } from "~/server/auth/auth.server";
import { db } from "~/server/database/db.server";
import { userInvites } from "~/server/database/schema.server";
import { apiUnauthorized } from "~/server/http/responses.server";
import { ROUTES } from "~/shared/constants";

export type SessionType = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export const sessionContext = createContext<SessionType>();

export async function requireAuth(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const url = new URL(request.url);
  const isApiRoute = url.pathname.startsWith("/api/");

  if (!session) {
    if (isApiRoute) throw apiUnauthorized();
    throw redirect(ROUTES.login.path);
  }

  const inviteCheck = await db
    .select({ id: userInvites.id })
    .from(userInvites)
    .where(eq(userInvites.email, session.user.email))
    .limit(1);

  if (inviteCheck.length === 0) {
    if (isApiRoute) throw apiUnauthorized("Bạn chưa được cấp quyền truy cập");
    throw redirect(`${ROUTES.login.path}?error=unauthorized`);
  }

  return session;
}
