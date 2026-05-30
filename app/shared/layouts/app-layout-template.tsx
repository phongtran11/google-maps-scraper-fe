import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { cn } from "~/shared/utils";
import { Menu } from "~/shared/icons/menu";
import { ChevronLeftIcon } from "~/shared/icons/chevron-left";
import { AdminSidebar } from "./admin-sidebar";
import type { BreadcrumbItem } from "~/shared/types";
import { Button } from "~/shared/components";

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
  const navigate = useNavigate();

  const handleCloseMobile = () => {
    setIsMobileOpen(false);
  };

  const handleOpenMobile = () => {
    setIsMobileOpen(true);
  };

  return (
    <div className="bg-background flex h-screen w-screen overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="border-border bg-card text-card-foreground hidden shrink-0 border-r md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col">
        <AdminSidebar currentPath={currentPath} user={currentUser} onSignOut={onSignOut} />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-all duration-300 md:hidden",
          isMobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {/* Overlay */}
        <div
          className={cn(
            "bg-background/80 absolute inset-0 backdrop-blur-sm transition-opacity duration-300",
            isMobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={handleCloseMobile}
        />

        {/* Drawer Content */}
        <aside
          className={cn(
            "bg-card border-border absolute inset-y-0 left-0 flex w-64 flex-col border-r shadow-xl transition-transform duration-350 ease-out",
            isMobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <AdminSidebar
            currentPath={currentPath}
            user={currentUser}
            onSignOut={onSignOut}
            onClickItem={handleCloseMobile}
            onClose={handleCloseMobile}
          />
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {/* Unified Header */}
        <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
          {/* Hamburger Menu (Mobile only) */}
          <button
            onClick={handleOpenMobile}
            className="hover:bg-accent text-muted-foreground hover:text-foreground -ml-2 shrink-0 cursor-pointer rounded-md p-2 transition-colors md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Back Button (for child pages) */}
          {!isRoot && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate(-1)}
                aria-label="Quay lại"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <span className="text-muted-foreground/45 shrink-0 select-none">|</span>
            </>
          )}

          {/* Breadcrumbs */}
          <nav className="text-muted-foreground flex min-w-0 flex-1 items-center gap-2 truncate text-sm font-medium select-none">
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-2 truncate">
                {idx > 0 && <span className="text-muted-foreground/45">/</span>}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-foreground truncate transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground truncate font-semibold">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>

          {/* Avatar on Mobile Header (Right side) */}
          <div className="flex shrink-0 items-center md:hidden">
            {currentUser.image ? (
              <img
                src={currentUser.image}
                alt={currentUser.name}
                className="h-7 w-7 rounded-full"
              />
            ) : (
              <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold">
                {currentUser.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* Content wrapper - Independent Y scroll */}
        <main className="bg-background flex-1 overflow-y-auto">
          <div className="container mx-auto w-full p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
