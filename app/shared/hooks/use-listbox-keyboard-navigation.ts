import { useEffect } from "react";

export interface UseListboxKeyboardNavigationOptions<T> {
  enabled: boolean;
  focusIndex: number;
  onClose: () => void;
  onFocusIndexChange: (index: number) => void;
  onSelect: (option: T) => void;
  options: T[];
}

export function useListboxKeyboardNavigation<T extends { disabled?: boolean; key: string }>({
  enabled,
  focusIndex,
  onClose,
  onFocusIndexChange,
  onSelect,
  options,
}: UseListboxKeyboardNavigationOptions<T>): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          let nextIndex = focusIndex + 1;
          while (nextIndex < options.length && options[nextIndex].disabled) {
            nextIndex++;
          }
          if (nextIndex < options.length) {
            onFocusIndexChange(nextIndex);
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
            onFocusIndexChange(prevIndex);
          }
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (focusIndex >= 0 && focusIndex < options.length) {
            const opt = options[focusIndex];
            if (!opt.disabled) {
              onSelect(opt);
            }
          }
          break;
        }
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, options, focusIndex, onFocusIndexChange, onSelect, onClose]);
}
