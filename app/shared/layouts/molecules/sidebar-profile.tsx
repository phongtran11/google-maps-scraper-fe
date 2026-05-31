import { memo } from "react";
import { ThemeToggle, Button } from "~/shared/components";
import { LogOut } from "~/shared/icons/log-out";

interface SidebarProfileProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onSignOut: () => void;
}

export const SidebarProfile = memo(function SidebarProfile({
  user,
  onSignOut,
}: SidebarProfileProps) {
  return (
    <div className="border-border mt-auto space-y-4 border-t p-4">
      <div className="flex items-center gap-3">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? ""}
            className="ring-primary/20 h-9 w-9 rounded-full ring-2"
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
          variant="destructiveOutline"
          size="sm"
          onClick={onSignOut}
          className="cursor-pointer text-xs font-medium"
        >
          <LogOut className="h-4 w-4" />
          Đăng Xuất
        </Button>
      </div>
    </div>
  );
});
