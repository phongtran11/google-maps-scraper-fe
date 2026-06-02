import type { ReactNode } from "react";

import { NavLink } from "react-router";

import { cn } from "~/shared/utils";

interface SidebarNavItemProps {
  icon: ReactNode;
  isActive?: boolean;
  isUpcoming?: boolean;
  label: string;
  onClick?: () => void;
  to: string;
}

export function SidebarNavItem({
  icon,
  isActive,
  isUpcoming,
  label,
  onClick,
  to,
}: SidebarNavItemProps) {
  const className = cn(
    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer w-full",
    isActive
      ? "bg-primary/10 text-primary font-semibold"
      : isUpcoming
        ? "text-muted-foreground/45 hover:bg-accent/20 hover:text-muted-foreground/60"
        : "text-muted-foreground hover:bg-accent hover:text-foreground",
  );

  if (isUpcoming) {
    return (
      <div className={className}>
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        <span className="bg-muted text-muted-foreground/80 rounded px-1.5 py-0.5 text-[10px] font-semibold">
          Sắp có
        </span>
      </div>
    );
  }

  return (
    <NavLink className={className} onClick={onClick} to={to}>
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
    </NavLink>
  );
}
