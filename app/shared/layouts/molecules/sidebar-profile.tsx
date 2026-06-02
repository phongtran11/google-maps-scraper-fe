import { memo } from "react";

import { Button, ThemeToggle } from "~/shared/components";
import { LogOut } from "~/shared/icons/log-out";

interface SidebarProfileProps {
  onSignOut: () => void;
  user: {
    email: string;
    image?: null | string;
    name: string;
  };
}

export const SidebarProfile = memo(function SidebarProfile({
  onSignOut,
  user,
}: SidebarProfileProps) {
  return (
    <div className="border-border mt-auto space-y-4 border-t p-4">
      <div className="flex items-center gap-3">
        {user.image ? (
          <img
            alt={user.name ?? ""}
            className="ring-primary/20 h-9 w-9 rounded-full ring-2"
            src={user.image}
          />
        ) : (
          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
            {user.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm leading-none font-medium">{user.name}</p>
          <p className="text-muted-foreground mt-1 truncate text-xs">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        <ThemeToggle />
        <Button
          className="cursor-pointer text-xs font-medium"
          onClick={onSignOut}
          size="sm"
          variant="destructiveOutline"
        >
          <LogOut className="h-4 w-4" />
          Đăng Xuất
        </Button>
      </div>
    </div>
  );
});
