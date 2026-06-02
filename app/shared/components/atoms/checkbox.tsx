import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { CheckIcon } from "~/shared/icons";
import { cn } from "~/shared/utils";

interface CheckboxProps extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
  indeterminate?: boolean;
  label?: ReactNode;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, className, disabled, indeterminate = false, label, ...props }, ref) => {
    const localRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => localRef.current!);

    // Handle indeterminate property on DOM element directly
    useEffect(() => {
      if (localRef.current) {
        localRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <label
        className={cn(
          "hover:bg-muted/40 items-[unset] flex cursor-pointer gap-2 rounded-sm px-1.5 py-1 text-xs transition-colors select-none",
          disabled && "cursor-not-allowed opacity-40",
          className,
        )}
      >
        <div className="border-input bg-background focus-within:ring-ring relative flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150 focus-within:ring-2">
          <input
            checked={checked}
            className="sr-only"
            disabled={disabled}
            ref={localRef}
            type="checkbox"
            {...props}
          />
          {checked && !indeterminate && <CheckIcon className="text-primary h-2.5 w-2.5" />}
          {indeterminate && <div className="bg-primary h-0.5 w-2 rounded-sm" />}
        </div>
        {label && <span className="min-w-0 flex-1 wrap-break-word">{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
export type { CheckboxProps };
