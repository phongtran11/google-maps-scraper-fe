import { useState, useRef, useEffect, useId } from "react";
import { cn } from "~/shared/utils";
import { ChevronDownIcon } from "~/shared/icons/chevron-down";

interface SubOption {
  key: string;
  label: string;
  disabled?: boolean;
}

interface GroupOption {
  label: string;
  options: SubOption[];
}

const selectVariants = {
  size: {
    sm: "h-8 rounded-md px-2 text-sm",
    md: "h-10 rounded-md px-3 text-sm",
    lg: "h-12 rounded-md px-4 text-base",
  },
} as const;

interface GroupedSelectProps {
  groups: GroupOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultOption?: { key: string; label: string };
  selectSize?: keyof typeof selectVariants.size;
  className?: string;
  "aria-label"?: string;
  disabled?: boolean;
}

interface FlatOption {
  key: string;
  label: string;
  disabled?: boolean;
  isDefault?: boolean;
}

export function GroupedSelect({
  groups,
  value,
  onChange,
  placeholder = "Chọn…",
  defaultOption,
  selectSize = "md",
  className,
  "aria-label": ariaLabel,
  disabled,
}: GroupedSelectProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();

  // Flatten options for keyboard navigation
  const flatOptions: FlatOption[] = [];
  if (defaultOption) {
    flatOptions.push({
      key: defaultOption.key,
      label: defaultOption.label,
      isDefault: true,
    });
  }

  for (const group of groups) {
    for (const opt of group.options) {
      flatOptions.push({
        key: opt.key,
        label: opt.label,
        disabled: opt.disabled,
      });
    }
  }

  const selectedOption = flatOptions.find((o) => o.key === value);

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
    if (open && flatOptions.length > 0) {
      const activeIndex = flatOptions.findIndex((o) => o.key === value);
      const initialIndex =
        activeIndex !== -1 && !flatOptions[activeIndex].disabled
          ? activeIndex
          : flatOptions.findIndex((o) => !o.disabled);
      setFocusIndex(initialIndex >= 0 ? initialIndex : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          let nextIndex = focusIndex + 1;
          while (nextIndex < flatOptions.length && flatOptions[nextIndex].disabled) {
            nextIndex++;
          }
          if (nextIndex < flatOptions.length) {
            setFocusIndex(nextIndex);
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          let prevIndex = focusIndex - 1;
          while (prevIndex >= 0 && flatOptions[prevIndex].disabled) {
            prevIndex--;
          }
          if (prevIndex >= 0) {
            setFocusIndex(prevIndex);
          }
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (focusIndex >= 0 && focusIndex < flatOptions.length) {
            const opt = flatOptions[focusIndex];
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
  }, [open, focusIndex, flatOptions]);

  // Handle scrolling of focused element into view
  useEffect(() => {
    if (!open || !listRef.current || focusIndex < 0) return;
    // Map focusIndex in flatOptions to actual DOM index in list element
    // Note: DOM index is different because we render headers (non-selectable elements) too!
    let domIndex = 0;
    let flatCounter = 0;

    if (defaultOption) {
      if (flatCounter === focusIndex) {
        const item = listRef.current.children[domIndex];
        if (item) (item as HTMLElement).scrollIntoView({ block: "nearest" });
        return;
      }
      domIndex++;
      flatCounter++;
    }

    for (const group of groups) {
      domIndex++; // Skip group header
      for (const _ of group.options) {
        if (flatCounter === focusIndex) {
          const item = listRef.current.children[domIndex];
          if (item) (item as HTMLElement).scrollIntoView({ block: "nearest" });
          return;
        }
        domIndex++;
        flatCounter++;
      }
    }
  }, [open, focusIndex, groups, defaultOption]);

  // Pre-calculate flat indices for rendering
  let currentFlatIndex = 0;

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
          "border-input bg-background text-foreground flex w-full items-center justify-between gap-2 border",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          selectVariants.size[selectSize],
          !selectedOption && "text-muted-foreground",
        )}
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
          ref={listRef}
          id={`${generatedId}-listbox`}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "border-border bg-popover absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border p-1 shadow-md",
            "transition-all duration-150",
          )}
        >
          {defaultOption && (() => {
            const index = currentFlatIndex;
            currentFlatIndex++;
            return (
              <li
                key={defaultOption.key}
                id={`${generatedId}-option-default`}
                role="option"
                aria-selected={defaultOption.key === value}
                onClick={() => select(defaultOption.key)}
                onMouseEnter={() => setFocusIndex(index)}
                className={cn(
                  "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  focusIndex === index && "bg-accent text-accent-foreground",
                  defaultOption.key === value && "font-medium",
                )}
              >
                {defaultOption.label}
              </li>
            );
          })()}

          {groups.map((group, groupIdx) => {
            const headerElement = (
              <li
                key={`group-header-${groupIdx}`}
                className="text-muted-foreground bg-muted/40 cursor-default px-2 py-1 text-xs font-semibold select-none"
              >
                {group.label}
              </li>
            );

            const optionElements = group.options.map((opt) => {
              const index = currentFlatIndex;
              currentFlatIndex++;
              return (
                <li
                  key={opt.key}
                  id={`${generatedId}-option-${index}`}
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
                      setFocusIndex(index);
                    }
                  }}
                  className={cn(
                    "relative flex cursor-pointer items-center rounded-sm pl-6 pr-2 py-1.5 text-sm outline-none select-none",
                    opt.disabled
                      ? "text-muted-foreground cursor-not-allowed opacity-40"
                      : "hover:bg-accent hover:text-accent-foreground",
                    !opt.disabled && focusIndex === index && "bg-accent text-accent-foreground",
                    opt.key === value && "font-medium",
                  )}
                >
                  {opt.label}
                </li>
              );
            });

            return [headerElement, ...optionElements];
          })}
        </ul>
      )}
    </div>
  );
}

GroupedSelect.displayName = "GroupedSelect";
export type { GroupedSelectProps, GroupOption, SubOption };
