import { requireAuth, sessionContext } from "~/server/auth/require-auth.server";

import type { Route } from "./+types/_protected";

export const middleware: Route.MiddlewareFunction[] = [
  async ({ context, request }, next) => {
    const session = await requireAuth(request);
    context.set(sessionContext, session);
    return next();
  },
];
