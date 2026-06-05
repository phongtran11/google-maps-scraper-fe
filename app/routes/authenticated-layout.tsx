import { useCallback } from "react";
import { Outlet, useLocation, useMatches, useNavigation } from "react-router";

import type { RouteMatch } from "~/shared/types";

import { sessionContext } from "~/server/auth/require-auth.server";
import { ROUTES } from "~/shared/constants";
import { AppLayoutTemplate } from "~/shared/layouts";
import { authClient, collectBreadcrumbs } from "~/shared/utils";

import type { Route } from "./+types/authenticated-layout";

export default function AuthenticatedLayout({ loaderData }: Route.ComponentProps) {
  const location = useLocation();
  const matches = useMatches();
  const navigation = useNavigation();

  const isLoading = navigation.state === "loading";

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
  const breadcrumbs = collectBreadcrumbs(matches as RouteMatch[]);

  return (
    <>
      {isLoading && (
        <div className="fixed top-0 left-0 z-50 h-1 w-full overflow-hidden">
          <div className="bg-primary animate-progress h-full w-1/3" />
        </div>
      )}
      <AppLayoutTemplate
        breadcrumbs={breadcrumbs}
        currentUser={currentUser}
        isRoot={isRoot}
        onSignOut={handleSignOut}
      >
        <Outlet />
      </AppLayoutTemplate>
    </>
  );
}

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);
  return { user: session.user };
}
