import { memo } from "react";
import { NavLink } from "react-router";

import { Button } from "~/shared/components";
import { ROUTES } from "~/shared/constants";
import { LayoutDashboard } from "~/shared/icons/layout-dashboard";
import { MapPin } from "~/shared/icons/map-pin";
import { UserCheck } from "~/shared/icons/user-check";
import { X } from "~/shared/icons/x";

import { SidebarNavItem } from "../molecules/sidebar-nav-item";
import { SidebarProfile } from "../molecules/sidebar-profile";

interface AdminSidebarProps {
  currentPath: string;
  onClickItem?: () => void;
  onClose?: () => void;
  onSignOut: () => void;
  user: {
    email: string;
    image?: null | string;
    name: string;
  };
}

export const AdminSidebar = memo(function AdminSidebar({
  currentPath,
  onClickItem,
  onClose,
  onSignOut,
  user,
}: AdminSidebarProps) {
  const isDashboardActive =
    currentPath === ROUTES.dashboard.path || ROUTES.businessDetail.pattern.test(currentPath);

  const navItems = [
    {
      icon: <LayoutDashboard className="h-4 w-4" />,
      isActive: isDashboardActive,
      label: ROUTES.dashboard.label,
      to: ROUTES.dashboard.path,
    },
    {
      icon: <UserCheck className="h-4 w-4" />,
      isActive: currentPath === ROUTES.invite.path,
      label: ROUTES.invite.label,
      to: ROUTES.invite.path,
    },
  ];

  return (
    <>
      <div className="border-border flex h-14 items-center justify-between border-b px-6">
        <NavLink
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight"
          onClick={onClickItem}
          to={ROUTES.dashboard.path}
        >
          <MapPin className="text-primary h-5 w-5" strokeWidth={2.5} />
          <span className="from-primary to-primary/75 bg-linear-to-r bg-clip-text text-transparent">
            Quản lý Khách Hàng
          </span>
        </NavLink>
        {onClose && (
          <Button
            className="text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer md:hidden"
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4">
        {navItems.map((item) => (
          <SidebarNavItem
            icon={item.icon}
            isActive={item.isActive}
            key={item.label}
            label={item.label}
            onClick={onClickItem}
            to={item.to}
          />
        ))}
      </nav>

      <SidebarProfile onSignOut={onSignOut} user={user} />
    </>
  );
});
export type { AdminSidebarProps };
