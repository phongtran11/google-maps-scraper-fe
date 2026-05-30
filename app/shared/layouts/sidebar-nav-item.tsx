import { NavLink } from "react-router";
import type { ReactNode } from "react";
import { cn } from "~/shared/utils";

interface SidebarNavItemProps {
  label: string;
  to: string;
  isActive?: boolean;
  isUpcoming?: boolean;
  icon: ReactNode;
  onClick?: () => void;
}

export function SidebarNavItem({
  label,
  to,
  isActive,
  isUpcoming,
  icon,
  onClick,
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
    <NavLink to={to} className={className} onClick={onClick}>
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
    </NavLink>
  );
}
