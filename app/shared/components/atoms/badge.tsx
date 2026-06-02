import type { ComponentProps } from "react";

import { forwardRef } from "react";

import { cn } from "~/shared/utils";

const badgeVariants = {
  size: {
    lg: "px-3 py-1.5 text-sm",
    md: "px-2.5 py-1 text-xs",
    sm: "px-1.5 py-0.5 text-xs",
  },
  variant: {
    default: "bg-primary text-primary-foreground shadow-sm",
    destructive: "bg-destructive/15 text-destructive",
    info: "bg-info/15 text-info",
    outline: "border border-border text-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning-foreground",
  },
} as const;

interface BadgeProps extends ComponentProps<"span"> {
  size?: keyof typeof badgeVariants.size;
  variant?: keyof typeof badgeVariants.variant;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, size = "md", variant = "default", ...props }, ref) => {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium whitespace-nowrap transition-colors",
          badgeVariants.variant[variant],
          badgeVariants.size[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
export type { BadgeProps };
