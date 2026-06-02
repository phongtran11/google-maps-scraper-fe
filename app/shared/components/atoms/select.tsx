import type { ReactNode } from "react";

import { useEffect, useId, useRef, useState } from "react";

import { useClickOutside, useListboxKeyboardNavigation } from "~/shared/hooks";
import { ChevronDownIcon } from "~/shared/icons/chevron-down";
import { cn } from "~/shared/utils";

interface SelectOption {
  disabled?: boolean;
  key: string;
  label: ReactNode;
}

const selectVariants = {
  size: {
    lg: "h-12 rounded-md px-4 text-base",
    md: "h-10 rounded-md px-3 text-sm",
    sm: "h-8 rounded-md px-2 text-sm",
  },
} as const;

interface SelectProps {
  "aria-label"?: string;
  className?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  selectSize?: keyof typeof selectVariants.size;
  value: string;
}

function Select({
  "aria-label": ariaLabel,
  className,
  disabled,
  onChange,
  options,
  placeholder = "Chọn…",
  selectSize = "md",
  value,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();

  const selectedOption = options.find((o) => o.key === value);

  const close = () => {
    setOpen(false);
    setFocusIndex(-1);
  };

  const select = (key: string) => {
    onChange(key);
    close();
  };

  const getInitialFocusIndex = () => {
    if (options.length === 0) return 0;
    const activeIndex = options.findIndex((o) => o.key === value);
    const initialIndex =
      activeIndex !== -1 && !options[activeIndex].disabled
        ? activeIndex
        : options.findIndex((o) => !o.disabled);
    return initialIndex >= 0 ? initialIndex : 0;
  };

  const handleOpen = () => {
    setOpen(true);
    setFocusIndex(getInitialFocusIndex());
  };

  const handleToggle = () => {
    if (open) {
      close();
    } else {
      handleOpen();
    }
  };

  useClickOutside(containerRef, close, open);

  useListboxKeyboardNavigation({
    enabled: open,
    focusIndex,
    onClose: close,
    onFocusIndexChange: setFocusIndex,
    onSelect: (opt) => select(opt.key),
    options,
  });

  useEffect(() => {
    if (!open || !listRef.current || focusIndex < 0) return;
    const items = listRef.current.children;
    if (items[focusIndex]) {
      (items[focusIndex] as HTMLElement).scrollIntoView({ block: "nearest" });
    }
  }, [open, focusIndex]);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={cn(
          "border-input bg-background text-foreground flex w-full items-center justify-between gap-2 border",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          selectVariants.size[selectSize],
          !selectedOption && "text-muted-foreground",
        )}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) {
              handleOpen();
            }
          }
        }}
        type="button"
      >
        <span className="truncate text-left">{selectedOption?.label ?? placeholder}</span>
        <ChevronDownIcon
          className={cn(
            "text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          aria-label={ariaLabel}
          className={cn(
            "border-border bg-popover absolute z-50 mt-1 w-full rounded-md border p-1 shadow-md",
            "transition-all duration-150",
          )}
          id={`${generatedId}-listbox`}
          ref={listRef}
          role="listbox"
        >
          {options.map((opt, i) => (
            <li
              aria-disabled={opt.disabled}
              aria-selected={opt.key === value}
              className={cn(
                "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none",
                opt.disabled
                  ? "text-muted-foreground cursor-not-allowed opacity-40"
                  : "hover:bg-accent hover:text-accent-foreground",
                !opt.disabled && focusIndex === i && "bg-accent text-accent-foreground",
                opt.key === value && "font-medium",
              )}
              id={`${generatedId}-option-${i}`}
              key={opt.key}
              onClick={() => {
                if (!opt.disabled) {
                  select(opt.key);
                }
              }}
              onMouseEnter={() => {
                if (!opt.disabled) {
                  setFocusIndex(i);
                }
              }}
              role="option"
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

Select.displayName = "Select";

export { Select, selectVariants };
export type { SelectOption, SelectProps };
