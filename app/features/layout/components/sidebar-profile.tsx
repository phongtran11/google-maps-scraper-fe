import { memo } from "react";
import { ThemeToggle } from "~/shared/components/theme-toggle";
import { LogOut } from "~/shared/icons/log-out";
import { Button } from "~/shared/components/button";

interface SidebarProfileProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onSignOut: () => void;
}

export const SidebarProfile = memo(function SidebarProfile({ user, onSignOut }: SidebarProfileProps) {

  return (
    <div className="mt-auto border-t border-border p-4 space-y-4">
      <div className="flex items-center gap-3">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? ""}
            className="h-9 w-9 rounded-full ring-2 ring-primary/20"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
            {user.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-none truncate text-foreground">
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {user.email}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        <ThemeToggle />
        <Button
          variant="destructiveOutline"
          size="sm"
          onClick={onSignOut}
          className="text-xs cursor-pointer font-medium"
        >
          <LogOut className="h-4 w-4" />
          Đăng Xuất
        </Button>
      </div>
    </div>
  );
});


