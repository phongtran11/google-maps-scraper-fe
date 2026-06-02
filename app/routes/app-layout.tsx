import type { LoaderFunctionArgs } from "react-router";

import { useCallback } from "react";
import { Outlet, useLoaderData, useLocation, useMatches } from "react-router";

import type { RouteMatch } from "~/shared/types";

import { requireAuth, sessionContext } from "~/server/auth/require-auth.server";
import { ROUTES } from "~/shared/constants";
import { AppLayoutTemplate } from "~/shared/layouts";
import { authClient, getBreadcrumbs } from "~/shared/utils";

import type { Route } from "./+types/app-layout";

export const middleware: Route.MiddlewareFunction[] = [
  async ({ context, request }, next) => {
    const session = await requireAuth(request);
    context.set(sessionContext, session);
    return next();
  },
];

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
    email: loaderData.user.email,
    image: loaderData.user.image ?? null,
    name: loaderData.user.name,
  };

  const isRoot = location.pathname === ROUTES.dashboard.path;

  const breadcrumbs = getBreadcrumbs(location.pathname, matches as unknown as RouteMatch[]);

  return (
    <AppLayoutTemplate
      breadcrumbs={breadcrumbs}
      currentPath={location.pathname}
      currentUser={currentUser}
      isRoot={isRoot}
      onSignOut={handleSignOut}
    >
      <Outlet />
    </AppLayoutTemplate>
  );
}

export async function loader({ context }: LoaderFunctionArgs) {
  const session = context.get(sessionContext);
  return { user: session.user };
}
