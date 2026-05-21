import { NavLink } from "react-router";
import { MapPin } from "~/shared/icons/map-pin";
import { LayoutDashboard } from "~/shared/icons/layout-dashboard";
import { BarChart } from "~/shared/icons/bar-chart";
import { UserCheck } from "~/shared/icons/user-check";
import { Settings } from "~/shared/icons/settings";
import { X } from "~/shared/icons/x";
import { SidebarNavItem } from "./sidebar-nav-item";
import { SidebarProfile } from "./sidebar-profile";
import { Button } from "~/shared/components/button";

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

export function AdminSidebar({
  currentPath,
  user,
  onSignOut,
  onClickItem,
  onClose,
}: AdminSidebarProps) {
  const isDashboardActive =
    currentPath === "/" || currentPath.startsWith("/businesses/");

  const navItems = [
    {
      label: "Trang Quản Trị",
      to: "/",
      isActive: isDashboardActive,
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Báo cáo & Thống kê",
      to: "#",
      isActive: false,
      isUpcoming: true,
      icon: <BarChart className="h-4 w-4" />,
    },
    {
      label: "Phân công liên hệ",
      to: "#",
      isActive: false,
      isUpcoming: true,
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      label: "Cấu hình scraper",
      to: "#",
      isActive: false,
      isUpcoming: true,
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <div className="flex h-14 items-center justify-between px-6 border-b border-border">
        <NavLink
          to="/"
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
            isUpcoming={item.isUpcoming}
            icon={item.icon}
            onClick={onClickItem}
          />
        ))}
      </nav>

      <SidebarProfile user={user} onSignOut={onSignOut} />
    </>
  );
}
export type { AdminSidebarProps };
