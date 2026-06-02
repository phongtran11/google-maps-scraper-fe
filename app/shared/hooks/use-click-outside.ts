import type { RefObject } from "react";

import { useEffect } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<null | T>,
  callback: () => void,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref, callback, enabled]);
}
