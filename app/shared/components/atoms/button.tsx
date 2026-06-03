import type { ComponentProps } from "react";

import { forwardRef } from "react";

import { Spinner } from "~/shared/icons/spinner";
import { cn } from "~/shared/utils";

const buttonBase =
  "focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

const buttonVariants = {
  size: {
    default: "h-10 px-4 py-2",
    icon: "h-10 w-10",
    lg: "h-11 rounded-md px-8 text-base",
    sm: "h-9 rounded-md px-3 text-sm",
    xs: "h-8 w-8 text-xs",
  },
  variant: {
    default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
    destructiveOutline:
      "border border-destructive/20 text-destructive bg-background shadow-sm hover:bg-destructive/10 hover:border-destructive/30",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    outline:
      "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  },
} as const;

interface ButtonProps extends ComponentProps<"button"> {
  loading?: boolean;
  size?: keyof typeof buttonVariants.size;
  variant?: keyof typeof buttonVariants.variant;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      loading = false,
      size = "default",
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const isIconOnly = size === "icon";

    return (
      <button
        aria-busy={loading || undefined}
        className={cn(
          buttonBase,
          buttonVariants.variant[variant],
          !isIconOnly && buttonVariants.size[size],
          isIconOnly && buttonVariants.size.icon,
          className,
        )}
        data-loading={loading || undefined}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <Spinner className="h-4 w-4" />}
        {isIconOnly && !loading ? <span className="sr-only">{children}</span> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonBase, buttonVariants };
export type { ButtonProps };
