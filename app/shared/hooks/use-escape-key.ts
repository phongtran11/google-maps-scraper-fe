import { useEffect } from "react";

export function useEscapeKey(
  callback: () => void,
  enabled: boolean,
  options?: { target?: "document" | "window" },
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        callback();
      }
    };

    const target = options?.target ?? "document";
    const targetElement = target === "window" ? window : document;

    targetElement.addEventListener("keydown", handleKeyDown as EventListener);
    return () => {
      targetElement.removeEventListener("keydown", handleKeyDown as EventListener);
    };
  }, [callback, enabled, options?.target]);
}
