import { useId, useRef, useState } from "react";

import { useClickOutside, useEscapeKey } from "~/shared/hooks";
import { ChevronDownIcon, X } from "~/shared/icons";
import { cn } from "~/shared/utils";

import { Button } from "../atoms/button";
import { Checkbox } from "../atoms/checkbox";

interface GroupOption {
  key: string;
  label: string;
  options: SubOption[];
}

interface SubOption {
  disabled?: boolean;
  key: string;
  label: string;
}

const selectVariants = {
  size: {
    lg: "h-12 rounded-md px-4 text-base",
    md: "h-10 rounded-md px-3 text-sm",
    sm: "h-8 rounded-md px-2 text-sm",
  },
} as const;

interface GroupedSelectCheckboxProps {
  "aria-label"?: string;
  className?: string;
  disabled?: boolean;
  groups: GroupOption[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  selectSize?: keyof typeof selectVariants.size;
  value: string[];
}

function GroupedSelectCheckbox({
  "aria-label": ariaLabel,
  className,
  disabled,
  groups,
  onChange,
  placeholder = "All items",
  selectSize = "md",
  value,
}: GroupedSelectCheckboxProps) {
  const [open, setOpen] = useState(false);
  const [activeGroupKey, setActiveGroupKey] = useState<string>("");
  const [draftSelected, setDraftSelected] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();

  const currentActiveGroupKey = activeGroupKey || groups[0]?.key || "";

  const handleOpen = () => {
    setDraftSelected(value);
    if (groups.length > 0) {
      setActiveGroupKey(groups[0].key);
    }
    setOpen(true);
  };

  const handleToggle = () => {
    if (open) {
      setOpen(false);
    } else {
      handleOpen();
    }
  };

  useClickOutside(containerRef, () => setOpen(false), open);

  useEscapeKey(() => setOpen(false), open);

  // Retrieve current active group option
  const activeGroup = groups.find((g) => g.key === currentActiveGroupKey);

  // Map selected keys to labels for trigger button text
  const getTriggerLabel = () => {
    if (value.length === 0) return placeholder;

    const labels: string[] = [];
    for (const group of groups) {
      for (const opt of group.options) {
        if (value.includes(opt.key)) {
          labels.push(opt.label);
        }
      }
    }

    if (labels.length === 0) return placeholder;
    return labels.join(", ");
  };

  // Toggle individual option in draft state
  const handleToggleOption = (key: string) => {
    setDraftSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // Keys of all enabled options in active group
  const activeGroupEnabledOptionKeys =
    activeGroup?.options.filter((o) => !o.disabled).map((o) => o.key) || [];

  // Keys of selected enabled options in active group
  const selectedEnabledInActiveGroup = activeGroupEnabledOptionKeys.filter((k) =>
    draftSelected.includes(k),
  );

  // Checkbox state for "Select All" in active group
  const isAllSelectedInActive =
    activeGroupEnabledOptionKeys.length > 0 &&
    selectedEnabledInActiveGroup.length === activeGroupEnabledOptionKeys.length;

  const isIndeterminateInActive =
    selectedEnabledInActiveGroup.length > 0 &&
    selectedEnabledInActiveGroup.length < activeGroupEnabledOptionKeys.length;

  // Toggle all enabled options in active group
  const handleToggleSelectAllActive = () => {
    if (isAllSelectedInActive) {
      setDraftSelected((prev) => prev.filter((k) => !activeGroupEnabledOptionKeys.includes(k)));
    } else {
      setDraftSelected((prev) => {
        const filtered = prev.filter((k) => !activeGroupEnabledOptionKeys.includes(k));
        return [...filtered, ...activeGroupEnabledOptionKeys];
      });
    }
  };

  // Count selected options in a specific group
  const getSelectedCountInGroup = (groupKey: string) => {
    const group = groups.find((g) => g.key === groupKey);
    if (!group) return 0;
    const optionKeys = group.options.map((o) => o.key);
    return draftSelected.filter((k) => optionKeys.includes(k)).length;
  };

  // Save draft selections and close popover
  const handleApply = () => {
    onChange(draftSelected);
    setOpen(false);
  };

  // Discard draft selections and close popover
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div className={cn("relative inline-block", className)} ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        className={cn(
          "border-input bg-background text-foreground flex w-full items-center justify-between gap-2 border",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          selectVariants.size[selectSize],
          value.length === 0 && "text-muted-foreground",
        )}
        disabled={disabled}
        onClick={handleToggle}
        title={getTriggerLabel()}
        type="button"
      >
        <span className="min-w-0 flex-1 truncate text-left">{getTriggerLabel()}</span>
        <ChevronDownIcon
          className={cn(
            "text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
            onClick={handleCancel}
          />
          <div
            aria-label={ariaLabel || "Selection popover"}
            className={cn(
              "border-border bg-popover text-popover-foreground flex flex-col transition-all duration-150",
              // Mobile layout (Bottom Sheet)
              "pb-safe-bottom fixed inset-x-0 bottom-0 z-50 h-[75vh] w-full rounded-t-xl border-t shadow-2xl",
              // Desktop layout override
              "md:absolute md:inset-auto md:top-full md:left-0 md:z-50 md:mt-1 md:h-auto md:w-[600px] md:rounded-md md:border md:shadow-md",
            )}
            id={`${generatedId}-popover`}
            role="dialog"
          >
            {/* Drag handle for mobile */}
            <div className="flex shrink-0 justify-center py-2 md:hidden">
              <div className="bg-muted-foreground/30 h-1.5 w-12 rounded-full" />
            </div>

            {/* Header */}
            <div className="border-border flex shrink-0 items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-semibold">Chọn khu vực</span>
              <button
                aria-label="Đóng bảng chọn"
                className="text-muted-foreground hover:text-foreground rounded-sm p-0.5 transition-colors outline-none"
                onClick={handleCancel}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1 md:h-[280px] md:flex-initial">
              {/* Left column: Group tabs */}
              <div className="border-border bg-muted/20 h-full w-5/12 overflow-y-auto border-r p-1">
                <ul aria-label="Group list" className="space-y-0.5" role="tablist">
                  {groups.map((group) => {
                    const isActive = group.key === currentActiveGroupKey;
                    const selectedCount = getSelectedCountInGroup(group.key);
                    return (
                      <li key={group.key}>
                        <button
                          aria-selected={isActive}
                          className={cn(
                            "hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left text-xs font-medium transition-colors outline-none",
                            isActive && "bg-accent text-accent-foreground font-semibold",
                          )}
                          onClick={() => setActiveGroupKey(group.key)}
                          role="tab"
                          type="button"
                        >
                          <span className="truncate">{group.label}</span>
                          {selectedCount > 0 && (
                            <span
                              className={cn(
                                "bg-primary text-primary-foreground flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                              )}
                            >
                              {selectedCount}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Right column: Options checkbox list */}
              <div className="flex h-full flex-1 flex-col overflow-y-auto p-3">
                {activeGroup ? (
                  <div className="flex flex-col gap-3">
                    {/* Select All option */}
                    <Checkbox
                      checked={isAllSelectedInActive}
                      className="font-semibold"
                      indeterminate={isIndeterminateInActive}
                      label="Chọn tất cả"
                      onChange={handleToggleSelectAllActive}
                    />

                    <div className="border-border/60 my-0.5 border-t"></div>

                    {/* Grid layout of options */}
                    <div className="grid grid-cols-1 gap-x-3 gap-y-2 md:grid-cols-2">
                      {activeGroup.options.map((opt) => {
                        const isChecked = draftSelected.includes(opt.key);
                        return (
                          <Checkbox
                            checked={isChecked}
                            disabled={opt.disabled}
                            key={opt.key}
                            label={opt.label}
                            onChange={() => handleToggleOption(opt.key)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                    No active group selected
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-border bg-muted/10 flex shrink-0 items-center justify-between border-t px-3 py-2 text-xs">
              <span className="text-muted-foreground font-medium">
                {draftSelected.length > 0
                  ? `Đã chọn ${draftSelected.length} khu vực`
                  : "Chưa chọn khu vực nào"}
              </span>
              <div className="flex gap-2">
                <Button onClick={handleCancel} size="sm" type="button" variant="outline">
                  Hủy
                </Button>
                <Button onClick={handleApply} size="sm" type="button" variant="default">
                  Áp dụng
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

GroupedSelectCheckbox.displayName = "GroupedSelectCheckbox";

export { GroupedSelectCheckbox };
export type { GroupedSelectCheckboxProps, GroupOption, SubOption };
