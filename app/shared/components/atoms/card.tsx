import type { ComponentProps } from "react";

import { forwardRef } from "react";

import { cn } from "~/shared/utils";

const cardVariants = {
  variant: {
    bordered: "bg-card text-card-foreground border-2 border-border",
    default: "bg-card text-card-foreground border border-border",
    elevated: "bg-card text-card-foreground shadow-lg",
  },
} as const;

interface CardProps extends ComponentProps<"div"> {
  variant?: keyof typeof cardVariants.variant;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      className={cn("rounded-lg", cardVariants.variant[variant], className)}
      ref={ref}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} ref={ref} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, ComponentProps<"h3">>(
  ({ className, ...props }, ref) => (
    <h3
      className={cn("text-lg leading-none font-semibold tracking-tight", className)}
      ref={ref}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-muted-foreground text-sm", className)} {...props} />;
}
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div className={cn("p-6 pt-0", className)} ref={ref} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div className={cn("flex items-center p-6 pt-0", className)} ref={ref} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants };
export type { CardProps };
