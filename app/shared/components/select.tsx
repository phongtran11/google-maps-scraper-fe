import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "~/lib/utils";
import { ChevronDownIcon } from "~/shared/icons/chevron-down";

interface SelectOption {
  key: string;
  label: string;
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
}

function Select({
  options,
  value,
  onChange,
  placeholder = "Chọn…",
  selectSize = "md",
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.key === value);

  const close = useCallback(() => {
    setOpen(false);
    setFocusIndex(-1);
  }, []);

  const select = useCallback(
    (key: string) => {
      onChange(key);
      close();
    },
    [onChange, close],
  );

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
        case "ArrowDown":
          e.preventDefault();
          setFocusIndex((prev) => Math.min(prev + 1, options.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (focusIndex >= 0 && focusIndex < options.length) {
            select(options[focusIndex].key);
          }
          break;
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
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) {
              setOpen(true);
              setFocusIndex(0);
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
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 shadow-md",
            "transition-all duration-150",
          )}
        >
          {options.map((opt, i) => (
            <li
              key={opt.key}
              role="option"
              aria-selected={opt.key === value}
              onClick={() => select(opt.key)}
              onMouseEnter={() => setFocusIndex(i)}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                "hover:bg-accent hover:text-accent-foreground",
                focusIndex === i && "bg-accent text-accent-foreground",
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
