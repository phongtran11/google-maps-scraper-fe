import { Outlet } from "react-router";
import type { Route } from "./+types/app-layout";
import { requireAuth } from "~/lib/require-auth";
import { authClient } from "~/lib/auth-client";
import { ThemeToggle } from "~/components/atoms/theme-toggle";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireAuth(request);
  return { user: session.user };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/6060">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <h1 className="font-semibold text-sm"></h1>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="flex items-center gap-3">
              {session?.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? ""}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">
                  {session?.user?.name ?? loaderData.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.email ?? loaderData.user.email}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = "/login";
                    },
                  },
                })
              }
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md h-9 px-3 text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Đăng Xuất
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
