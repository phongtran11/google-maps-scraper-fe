import type { ComponentProps, ReactNode } from "react";
import { forwardRef, useId } from "react";

import { cn } from "~/shared/utils";

const inputVariants = {
  variant: {
    default: "border border-input bg-background text-foreground placeholder:text-muted-foreground",
    filled: "border-0 bg-muted text-foreground placeholder:text-muted-foreground",
  },
  inputSize: {
    sm: "h-8 rounded-md px-2 text-sm",
    md: "h-10 rounded-md px-3 text-sm",
    lg: "h-12 rounded-md px-4 text-base",
  },
} as const;

interface InputProps extends Omit<ComponentProps<"input">, "size"> {
  variant?: keyof typeof inputVariants.variant;
  inputSize?: keyof typeof inputVariants.inputSize;
  error?: boolean;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = "default",
      inputSize = "md",
      error = false,
      prefixIcon,
      suffixIcon,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();

    return (
      <div className="relative flex items-center">
        {prefixIcon && (
          <span className="text-muted-foreground absolute left-3 flex items-center [&_svg]:size-4">
            {prefixIcon}
          </span>
        )}
        <input
          ref={ref}
          id={props.id ?? generatedId}
          disabled={disabled}
          aria-invalid={error || undefined}
          data-error={error || undefined}
          className={cn(
            "focus-visible:ring-ring flex w-full file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            inputVariants.variant[variant],
            inputVariants.inputSize[inputSize],
            prefixIcon && "pl-9",
            suffixIcon && "pr-9",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
          {...props}
        />
        {suffixIcon && (
          <span className="text-muted-foreground absolute right-3 flex items-center [&_svg]:size-4">
            {suffixIcon}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
export type { InputProps };
