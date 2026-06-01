import type { ComponentProps } from "react";
import { forwardRef } from "react";

import { cn } from "~/shared/utils";

const textareaVariants = {
  variant: {
    default: "border border-input bg-background text-foreground placeholder:text-muted-foreground",
    filled: "border-0 bg-muted text-foreground placeholder:text-muted-foreground",
  },
} as const;

interface TextareaProps extends ComponentProps<"textarea"> {
  variant?: keyof typeof textareaVariants.variant;
  error?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "default", error = false, disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        aria-invalid={error || undefined}
        data-error={error || undefined}
        className={cn(
          "focus-visible:ring-ring flex w-full rounded-md px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          textareaVariants.variant[variant],
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
export type { TextareaProps };
