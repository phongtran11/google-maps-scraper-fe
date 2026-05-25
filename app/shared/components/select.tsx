import { useState, useRef, useEffect, useId } from "react";
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";
import { ChevronDownIcon } from "~/shared/icons/chevron-down";

interface SelectOption {
  key: string;
  label: ReactNode;
  disabled?: boolean;
}

const selectVariants = {
  size: {
    sm: "h-8 rounded-md px-2 text-sm",
    md: "h-10 rounded-md px-3 text-sm",
    lg: "h-12 rounded-md px-4 text-base",
  },
} as const;

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  selectSize?: keyof typeof selectVariants.size;
  className?: string;
  "aria-label"?: string;
  disabled?: boolean;
}

function Select({
  options,
  value,
  onChange,
  placeholder = "Chọn…",
  selectSize = "md",
  className,
  "aria-label": ariaLabel,
  disabled,
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

  // Initialize focusIndex when the dropdown is opened
  useEffect(() => {
    if (open) {
      const activeIndex = options.findIndex((o) => o.key === value);
      const initialIndex =
        activeIndex !== -1 && !options[activeIndex].disabled
          ? activeIndex
          : options.findIndex((o) => !o.disabled);
      setFocusIndex(initialIndex >= 0 ? initialIndex : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          let nextIndex = focusIndex + 1;
          while (nextIndex < options.length && options[nextIndex].disabled) {
            nextIndex++;
          }
          if (nextIndex < options.length) {
            setFocusIndex(nextIndex);
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          let prevIndex = focusIndex - 1;
          while (prevIndex >= 0 && options[prevIndex].disabled) {
            prevIndex--;
          }
          if (prevIndex >= 0) {
            setFocusIndex(prevIndex);
          }
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (focusIndex >= 0 && focusIndex < options.length) {
            const opt = options[focusIndex];
            if (!opt.disabled) {
              select(opt.key);
            }
          }
          break;
        }
        case "Escape":
          e.preventDefault();
          close();
          break;
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, focusIndex, options, select, close]);

  useEffect(() => {
    if (!open || !listRef.current || focusIndex < 0) return;
    const items = listRef.current.children;
    if (items[focusIndex]) {
      (items[focusIndex] as HTMLElement).scrollIntoView({ block: "nearest" });
    }
  }, [open, focusIndex]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) {
              setOpen(true);
            }
          }
        }}
        className={cn(
          "flex w-full items-center justify-between gap-2 border border-input bg-background text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          selectVariants.size[selectSize],
          !selectedOption && "text-muted-foreground",
        )}
      >
        <span className="truncate text-left">
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${generatedId}-listbox`}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 shadow-md",
            "transition-all duration-150",
          )}
        >
          {options.map((opt, i) => (
            <li
              key={opt.key}
              id={`${generatedId}-option-${i}`}
              role="option"
              aria-selected={opt.key === value}
              aria-disabled={opt.disabled}
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
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                opt.disabled
                  ? "cursor-not-allowed opacity-40 text-muted-foreground"
                  : "hover:bg-accent hover:text-accent-foreground",
                !opt.disabled && focusIndex === i && "bg-accent text-accent-foreground",
                opt.key === value && "font-medium",
              )}
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
export type { SelectProps, SelectOption };

