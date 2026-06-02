import type { ComponentProps } from "react";

import { forwardRef } from "react";

import { cn } from "~/shared/utils";

const alertVariants = {
  variant: {
    default: "bg-muted text-foreground border-border",
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
    info: "bg-info/10 text-info border-info/30",
    success: "bg-success/10 text-success border-success/30",
    warning: "bg-warning/10 text-warning-foreground border-warning/30",
  },
} as const;

interface AlertProps extends ComponentProps<"div"> {
  variant?: keyof typeof alertVariants.variant;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg]:text-current [&>svg~*]:pl-7",
        alertVariants.variant[variant],
        className,
      )}
      ref={ref}
      role="alert"
      {...props}
    />
  ),
);
Alert.displayName = "Alert";

const AlertTitle = forwardRef<HTMLHeadingElement, ComponentProps<"h5">>(
  ({ className, ...props }, ref) => (
    <h5
      className={cn("mb-1 leading-none font-medium tracking-tight", className)}
      ref={ref}
      {...props}
    />
  ),
);
AlertTitle.displayName = "AlertTitle";

function AlertDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />;
}
AlertDescription.displayName = "AlertDescription";

const AlertAction = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div className={cn("mt-3 flex items-center gap-2", className)} ref={ref} {...props} />
  ),
);
AlertAction.displayName = "AlertAction";

export { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants };
export type { AlertProps };
