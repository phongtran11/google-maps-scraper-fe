import type { ReactNode } from "react";

import { NavLink } from "react-router";

import { cn } from "~/shared/utils";

type SidebarNavItemProps = {
  icon: ReactNode;
  isActive?: boolean;
  label: string;
  onClick?: () => void;
  to: string;
};

export function SidebarNavItem({ icon, label, onClick, to }: SidebarNavItemProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive && "bg-primary/10 text-primary font-semibold",
        )
      }
      onClick={onClick}
      to={to}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
    </NavLink>
  );
}
