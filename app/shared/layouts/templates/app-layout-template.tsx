import type { ReactNode } from "react";

import { ChevronLeft, Menu } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import type { BreadcrumbItem } from "~/shared/types";

import { Button } from "~/shared/components";
import { cn } from "~/shared/utils";

import { AdminSidebar } from "../organisms/admin-sidebar";

export type AppLayoutTemplateProps = {
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
  currentUser: {
    email: string;
    image: null | string;
    name: string;
  };
  isRoot: boolean;
  onSignOut: () => void;
};

export function AppLayoutTemplate({
  breadcrumbs,
  children,
  currentUser,
  isRoot,
  onSignOut,
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
        <AdminSidebar onSignOut={onSignOut} user={currentUser} />
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
            onClickItem={handleCloseMobile}
            onClose={handleCloseMobile}
            onSignOut={onSignOut}
            user={currentUser}
          />
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {/* Unified Header */}
        <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
          {/* Hamburger Menu (Mobile only) */}
          <button
            aria-label="Open menu"
            className="hover:bg-accent text-muted-foreground hover:text-foreground -ml-2 shrink-0 cursor-pointer rounded-md p-2 transition-colors md:hidden"
            onClick={handleOpenMobile}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Back Button (for child pages) */}
          {!isRoot && (
            <>
              <Button
                aria-label="Quay lại"
                onClick={() => navigate(-1)}
                size="icon"
                variant="ghost"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-muted-foreground/45 shrink-0 select-none">|</span>
            </>
          )}

          {/* Breadcrumbs */}
          <nav className="text-muted-foreground flex min-w-0 flex-1 items-center gap-2 truncate text-sm font-medium select-none">
            {breadcrumbs.map((crumb, idx) => (
              <div className="flex items-center gap-2 truncate" key={idx}>
                {idx > 0 && <span className="text-muted-foreground/45">/</span>}
                {crumb.to ? (
                  <Link className="hover:text-foreground truncate transition-colors" to={crumb.to}>
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
                alt={currentUser.name}
                className="h-7 w-7 rounded-full"
                src={currentUser.image}
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
          <div className="container mx-auto w-full space-y-8 p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
