import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";
import { Spinner } from "~/shared/icons/spinner";

const buttonVariants = {
  variant: {
    default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
    destructive:
      "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
    outline:
      "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
    secondary:
      "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    destructiveOutline:
      "border border-destructive/20 text-destructive bg-background shadow-sm hover:bg-destructive/10 hover:border-destructive/30",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3 text-sm",
    lg: "h-11 rounded-md px-8 text-base",
    icon: "h-10 w-10",
  },
} as const;

interface ButtonProps extends ComponentProps<"button"> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isIconOnly = size === "icon";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          buttonVariants.variant[variant],
          !isIconOnly && buttonVariants.size[size],
          isIconOnly && buttonVariants.size.icon,
          className,
        )}
        {...props}
      >
        {loading && <Spinner className="h-4 w-4" />}
        {isIconOnly && !loading ? (
          <span className="sr-only">{children}</span>
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
