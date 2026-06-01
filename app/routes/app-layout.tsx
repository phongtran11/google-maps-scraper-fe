import { useCallback } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useLocation, useMatches } from "react-router";

import { requireAuth, sessionContext } from "~/server/auth/require-auth.server";
import { ROUTES } from "~/shared/constants";
import { AppLayoutTemplate } from "~/shared/layouts";
import type { RouteMatch } from "~/shared/types";
import { authClient, getBreadcrumbs } from "~/shared/utils";

import type { Route } from "./+types/app-layout";

export const middleware: Route.MiddlewareFunction[] = [
  async ({ request, context }, next) => {
    const session = await requireAuth(request);
    context.set(sessionContext, session);
    return next();
  },
];

export async function loader({ context }: LoaderFunctionArgs) {
  const session = context.get(sessionContext);
  return { user: session.user };
}

export default function AppLayout() {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();
  const matches = useMatches();

  const handleSignOut = useCallback(() => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = ROUTES.login.path;
        },
      },
    });
  }, []);

  const currentUser = {
    name: loaderData.user.name,
    email: loaderData.user.email,
    image: loaderData.user.image ?? null,
  };

  const isRoot = location.pathname === ROUTES.dashboard.path;

  const breadcrumbs = getBreadcrumbs(location.pathname, matches as unknown as RouteMatch[]);

  return (
    <AppLayoutTemplate
      currentUser={currentUser}
      breadcrumbs={breadcrumbs}
      currentPath={location.pathname}
      isRoot={isRoot}
      onSignOut={handleSignOut}
    >
      <Outlet />
    </AppLayoutTemplate>
  );
}
