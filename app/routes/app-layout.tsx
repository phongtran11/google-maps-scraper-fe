import { Outlet, useLocation, useMatches, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useCallback, useMemo } from "react";
import { requireAuth, sessionContext } from "~/lib/server/require-auth.server";
import { authClient } from "~/lib/auth-client";
import { AppLayoutTemplate } from "~/features/layout/components/app-layout-template";
import { getBreadcrumbs } from "~/features/layout/breadcrumbs";
import type { RouteMatch } from "~/features/layout/breadcrumbs";
import type { Route } from "./+types/app-layout";
import { ROUTES } from "~/lib/routes";

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
  const { data: session } = authClient.useSession();
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

  const sessionUser = session?.user;
  const loaderUser = loaderData.user;
  const currentUser = useMemo(() => ({
    name: sessionUser?.name ?? loaderUser.name,
    email: sessionUser?.email ?? loaderUser.email,
    image: sessionUser?.image ?? null,
  }), [sessionUser?.name, sessionUser?.email, sessionUser?.image, loaderUser.name, loaderUser.email]);

  const isRoot = location.pathname === ROUTES.dashboard.path;

  const breadcrumbs = useMemo(() => {
    return getBreadcrumbs(location.pathname, matches as unknown as RouteMatch[]);
  }, [location.pathname, matches]);

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

