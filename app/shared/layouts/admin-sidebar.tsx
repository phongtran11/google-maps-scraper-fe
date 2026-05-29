import { memo } from "react";
import { NavLink } from "react-router";
import { MapPin } from "~/shared/icons/map-pin";
import { LayoutDashboard } from "~/shared/icons/layout-dashboard";
import { X } from "~/shared/icons/x";
import { UserCheck } from "~/shared/icons/user-check";
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
    currentPath === ROUTES.dashboard.path || ROUTES.businessDetail.pattern.test(currentPath);

  const navItems = [
    {
      label: ROUTES.dashboard.label,
      to: ROUTES.dashboard.path,
      isActive: isDashboardActive,
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: ROUTES.invite.label,
      to: ROUTES.invite.path,
      isActive: currentPath === ROUTES.invite.path,
      icon: <UserCheck className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <div className="border-border flex h-14 items-center justify-between border-b px-6">
        <NavLink
          to={ROUTES.dashboard.path}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight"
          onClick={onClickItem}
        >
          <MapPin className="text-primary h-5 w-5" strokeWidth={2.5} />
          <span className="from-primary to-primary/75 bg-linear-to-r bg-clip-text text-transparent">
            Quản lý Khách Hàng
          </span>
        </NavLink>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4">
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
