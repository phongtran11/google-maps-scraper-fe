import { memo } from "react";
import { NavLink } from "react-router";

import { Button } from "~/shared/components";
import { ROUTES } from "~/shared/constants";
import { X } from "~/shared/icons/x";

import { SidebarNavItem } from "../molecules/sidebar-nav-item";
import { SidebarProfile } from "../molecules/sidebar-profile";
import { NAV_ITEMS } from "../nav.constant";

interface AdminSidebarProps {
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
  onClickItem,
  onClose,
  onSignOut,
  user,
}: AdminSidebarProps) {
  return (
    <>
      <div className="border-border flex h-14 items-center justify-between border-b px-6">
        <NavLink
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight"
          onClick={onClickItem}
          to={ROUTES.dashboard.path}
        >
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
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            icon={item.icon}
            key={item.to}
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
