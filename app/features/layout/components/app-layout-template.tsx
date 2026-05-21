import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "~/lib/utils";
import { Menu } from "~/shared/icons/menu";
import { ChevronLeftIcon } from "~/shared/icons/chevron-left";
import { AdminSidebar } from "./admin-sidebar";
import type { BreadcrumbItem } from "../breadcrumbs";

export interface AppLayoutTemplateProps {
  currentUser: {
    name: string;
    email: string;
    image: string | null;
  };
  breadcrumbs: BreadcrumbItem[];
  currentPath: string;
  isRoot: boolean;
  onSignOut: () => void;
  children: ReactNode;
}

export function AppLayoutTemplate({
  currentUser,
  breadcrumbs,
  currentPath,
  isRoot,
  onSignOut,
  children,
}: AppLayoutTemplateProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:h-screen md:sticky md:top-0 border-r border-border bg-card text-card-foreground shrink-0">
        <AdminSidebar
          currentPath={currentPath}
          user={currentUser}
          onSignOut={onSignOut}
        />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden transition-all duration-300",
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
            isMobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Drawer Content */}
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col transition-transform duration-350 ease-out shadow-xl",
            isMobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <AdminSidebar
            currentPath={currentPath}
            user={currentUser}
            onSignOut={onSignOut}
            onClickItem={() => setIsMobileOpen(false)}
            onClose={() => setIsMobileOpen(false)}
          />
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Unified Header */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 sm:px-6 sticky top-0 z-40 shrink-0">
          {/* Hamburger Menu (Mobile only) */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Back Button (for child pages) */}
          {!isRoot && (
            <>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
                aria-label="Quay lại"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </Link>
              <span className="text-muted-foreground/45 shrink-0 select-none">
                |
              </span>
            </>
          )}

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground truncate select-none flex-1 min-w-0">
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-2 truncate">
                {idx > 0 && <span className="text-muted-foreground/45">/</span>}
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-semibold truncate">
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </nav>

          {/* Avatar on Mobile Header (Right side) */}
          <div className="md:hidden flex items-center shrink-0">
            {currentUser.image ? (
              <img
                src={currentUser.image}
                alt={currentUser.name}
                className="h-7 w-7 rounded-full"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                {currentUser.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* Content wrapper - Independent Y scroll */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
