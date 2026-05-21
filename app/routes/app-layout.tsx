import { Outlet, useLocation, useMatches, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { requireAuth, sessionContext } from "~/lib/server/require-auth.server";
import { authClient } from "~/lib/auth-client";
import { AppLayoutTemplate } from "~/features/layout/components/app-layout-template";
import { getBreadcrumbs } from "~/features/layout/breadcrumbs";
import type { RouteMatch } from "~/features/layout/breadcrumbs";
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
  const { data: session } = authClient.useSession();
  const location = useLocation();
  const matches = useMatches();

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  };

  const currentUser = {
    name: session?.user?.name ?? loaderData.user.name,
    email: session?.user?.email ?? loaderData.user.email,
    image: session?.user?.image ?? null,
  };

  const isRoot = location.pathname === "/";
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
