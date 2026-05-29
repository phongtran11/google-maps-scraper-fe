import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";

const cardVariants = {
  variant: {
    default: "bg-card text-card-foreground border border-border",
    bordered: "bg-card text-card-foreground border-2 border-border",
    elevated: "bg-card text-card-foreground shadow-lg",
  },
} as const;

interface CardProps extends ComponentProps<"div"> {
  variant?: keyof typeof cardVariants.variant;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg", cardVariants.variant[variant], className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, ComponentProps<"h3">>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg leading-none font-semibold tracking-tight", className)}
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
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
export type { CardProps };
