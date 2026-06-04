import type { ReactNode } from "react";

import { ROUTES } from "~/shared/constants";
import { Building } from "~/shared/icons/building";
import { LayoutDashboard } from "~/shared/icons/layout-dashboard";
import { UserCheck } from "~/shared/icons/user-check";

export interface NavItem {
  icon: ReactNode;
  label: string;
  to: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Trang Quản Trị",
    to: ROUTES.dashboard.path,
  },
  {
    icon: <Building className="h-4 w-4" />,
    label: "Doanh Nghiệp",
    to: ROUTES.businesses.path,
  },
  {
    icon: <UserCheck className="h-4 w-4" />,
    label: "Mời Thành Viên",
    to: ROUTES.invite.path,
  },
];
