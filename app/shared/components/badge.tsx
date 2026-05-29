import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";

const badgeVariants = {
  variant: {
    default: "bg-primary text-primary-foreground shadow-sm",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive/15 text-destructive",
    outline: "border border-border text-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    info: "bg-info/15 text-info",
  },
  size: {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  },
} as const;

interface BadgeProps extends ComponentProps<"span"> {
  variant?: keyof typeof badgeVariants.variant;
  size?: keyof typeof badgeVariants.size;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full font-medium whitespace-nowrap transition-colors",
          badgeVariants.variant[variant],
          badgeVariants.size[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
export type { BadgeProps };
