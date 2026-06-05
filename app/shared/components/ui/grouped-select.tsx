import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useClickOutside, useListboxKeyboardNavigation } from "~/shared/hooks";
import { cn } from "~/shared/utils";

type GroupOption = {
  label: string;
  options: SubOption[];
};

type SubOption = {
  disabled?: boolean;
  key: string;
  label: string;
};

const selectVariants = {
  size: {
    lg: "h-12 rounded-md px-4 text-base",
    md: "h-10 rounded-md px-3 text-sm",
    sm: "h-8 rounded-md px-2 text-sm",
  },
} as const;

type FlatOption = {
  disabled?: boolean;
  isDefault?: boolean;
  key: string;
  label: string;
};

type GroupedSelectProps = {
  "aria-label"?: string;
  className?: string;
  defaultOption?: { key: string; label: string };
  disabled?: boolean;
  groups: GroupOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  selectSize?: keyof typeof selectVariants.size;
  value: string;
};

export function GroupedSelect({
  "aria-label": ariaLabel,
  className,
  defaultOption,
  disabled,
  groups,
  onChange,
  placeholder = "Chọn…",
  selectSize = "md",
  value,
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
      isDefault: true,
      key: defaultOption.key,
      label: defaultOption.label,
    });
  }

  for (const group of groups) {
    for (const opt of group.options) {
      flatOptions.push({
        disabled: opt.disabled,
        key: opt.key,
        label: opt.label,
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

  const getInitialFocusIndex = () => {
    if (flatOptions.length === 0) return 0;
    const activeIndex = flatOptions.findIndex((o) => o.key === value);
    const initialIndex =
      activeIndex !== -1 && !flatOptions[activeIndex].disabled
        ? activeIndex
        : flatOptions.findIndex((o) => !o.disabled);
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
    options: flatOptions,
  });

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        <ChevronDown
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
            "border-border bg-popover absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border p-1 shadow-md",
            "transition-all duration-150",
          )}
          id={`${generatedId}-listbox`}
          ref={listRef}
          role="listbox"
        >
          {defaultOption &&
            (() => {
              const index = currentFlatIndex;
              currentFlatIndex++;
              return (
                <li
                  aria-selected={defaultOption.key === value}
                  className={cn(
                    "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    focusIndex === index && "bg-accent text-accent-foreground",
                    defaultOption.key === value && "font-medium",
                  )}
                  id={`${generatedId}-option-default`}
                  key={defaultOption.key}
                  onClick={() => select(defaultOption.key)}
                  onMouseEnter={() => setFocusIndex(index)}
                  role="option"
                >
                  {defaultOption.label}
                </li>
              );
            })()}

          {groups.map((group, groupIdx) => {
            const headerElement = (
              <li
                className="text-muted-foreground bg-muted/40 cursor-default px-2 py-1 text-xs font-semibold select-none"
                key={`group-header-${groupIdx}`}
              >
                {group.label}
              </li>
            );

            const optionElements = group.options.map((opt) => {
              const index = currentFlatIndex;
              currentFlatIndex++;
              return (
                <li
                  aria-disabled={opt.disabled}
                  aria-selected={opt.key === value}
                  className={cn(
                    "relative flex cursor-pointer items-center rounded-sm py-1.5 pr-2 pl-6 text-sm outline-none select-none",
                    opt.disabled
                      ? "text-muted-foreground cursor-not-allowed opacity-40"
                      : "hover:bg-accent hover:text-accent-foreground",
                    !opt.disabled && focusIndex === index && "bg-accent text-accent-foreground",
                    opt.key === value && "font-medium",
                  )}
                  id={`${generatedId}-option-${index}`}
                  key={opt.key}
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
                  role="option"
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
