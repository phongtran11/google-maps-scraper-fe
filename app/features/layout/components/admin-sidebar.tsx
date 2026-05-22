import { memo } from "react";
import { NavLink } from "react-router";
import { MapPin } from "~/shared/icons/map-pin";
import { LayoutDashboard } from "~/shared/icons/layout-dashboard";
import { X } from "~/shared/icons/x";
import { SidebarNavItem } from "./sidebar-nav-item";
import { SidebarProfile } from "./sidebar-profile";
import { Button } from "~/shared/components/button";
import { ROUTES } from "~/lib/routes";

interface AdminSidebarProps {
  currentPath: string;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onSignOut: () => void;
  onClickItem?: () => void;
  onClose?: () => void;
}

export const AdminSidebar = memo(function AdminSidebar({
  currentPath,
  user,
  onSignOut,
  onClickItem,
  onClose,
}: AdminSidebarProps) {
  const isDashboardActive =
    currentPath === ROUTES.dashboard.path ||
    ROUTES.businessDetail.pattern.test(currentPath);

  const navItems = [
    {
      label: ROUTES.dashboard.label,
      to: ROUTES.dashboard.path,
      isActive: isDashboardActive,
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <div className="flex h-14 items-center justify-between px-6 border-b border-border">
        <NavLink
          to={ROUTES.dashboard.path}
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight"
          onClick={onClickItem}
        >
          <MapPin className="h-5 w-5 text-primary" strokeWidth={2.5} />
          <span className="bg-linear-to-r from-primary to-primary/75 bg-clip-text text-transparent">
            Quản lý Khác Hàng
          </span>
        </NavLink>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground md:hidden cursor-pointer"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.label}
            label={item.label}
            to={item.to}
            isActive={item.isActive}
            icon={item.icon}
            onClick={onClickItem}
          />
        ))}
      </nav>

      <SidebarProfile user={user} onSignOut={onSignOut} />
    </>
  );
});
export type { AdminSidebarProps };
