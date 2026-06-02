import type { FocusEvent, MouseEvent, ReactElement, ReactNode, Ref } from "react";

import { Children, cloneElement, memo, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useEscapeKey } from "~/shared/hooks";
import { cn } from "~/shared/utils";

export interface TooltipProps {
  children: ReactElement;
  className?: string;
  content: ReactNode;
  delay?: number;
}

const TooltipComponent = memo(function Tooltip({
  children,
  className,
  content,
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<null | { left: number; top: number }>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const showTimeout = useRef<null | ReturnType<typeof setTimeout>>(null);
  const hideTimeout = useRef<null | ReturnType<typeof setTimeout>>(null);
  const tooltipId = useId();

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeout.current) clearTimeout(showTimeout.current);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        left: rect.left + rect.width / 2,
        top: rect.top,
      });
    }
  };

  const showTooltip = () => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    if (!showTimeout.current && !isVisible) {
      showTimeout.current = setTimeout(() => {
        updateCoords();
        setIsVisible(true);
      }, delay);
    } else if (isVisible) {
      // If already visible, just ensure it stays visible (e.g. hovered from trigger to tooltip)
      updateCoords();
    }
  };

  const hideTooltip = () => {
    if (showTimeout.current) {
      clearTimeout(showTimeout.current);
      showTimeout.current = null;
    }
    if (!hideTimeout.current) {
      hideTimeout.current = setTimeout(() => {
        setIsVisible(false);
      }, 100);
    }
  };

  useEscapeKey(() => setIsVisible(false), isVisible, { target: "window" });

  // Re-position or hide on scroll / resize
  useEffect(() => {
    if (!isVisible) return;

    const handleScrollResize = () => {
      updateCoords();
    };

    // Capture scrolls on any container to keep position correct
    window.addEventListener("scroll", handleScrollResize, true);
    window.addEventListener("resize", handleScrollResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScrollResize, true);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, [isVisible]);

  // Ensure children is a single React element
  const child = Children.only(children) as ReactElement<{
    onBlur?: (e: FocusEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    ref?: Ref<HTMLElement>;
  }>;

  // Merge refs
  const handleRef = (node: HTMLElement | null) => {
    triggerRef.current = node;
    const { ref } = child as { ref?: Ref<HTMLElement> };
    if (typeof ref === "function") {
      ref(node);
    } else if (ref && typeof ref === "object") {
      ref.current = node;
    }
  };

  const triggerProps = {
    "aria-describedby": isVisible ? tooltipId : undefined,
    onBlur: (e: FocusEvent) => {
      child.props.onBlur?.(e);
      hideTooltip();
    },
    onFocus: (e: FocusEvent) => {
      child.props.onFocus?.(e);
      showTooltip();
    },
    onMouseEnter: (e: MouseEvent) => {
      child.props.onMouseEnter?.(e);
      showTooltip();
    },
    onMouseLeave: (e: MouseEvent) => {
      child.props.onMouseLeave?.(e);
      hideTooltip();
    },
    ref: handleRef,
  };

  const clonedChild = cloneElement(child, triggerProps);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!content) return children;

  return (
    <>
      {clonedChild}
      {mounted &&
        isVisible &&
        coords &&
        createPortal(
          <div
            className={cn(
              "bg-popover text-popover-foreground border-border animate-in fade-in zoom-in-95 max-w-[280px] rounded-md border px-3 py-1.5 text-xs leading-relaxed font-normal wrap-break-word shadow-md duration-150 select-none",
              className,
            )}
            id={tooltipId}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            role="tooltip"
            style={{
              left: `${coords.left}px`,
              position: "fixed",
              top: `${coords.top - 6}px`,
              transform: "translate(-50%, -100%)",
              zIndex: 9999,
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
});
TooltipComponent.displayName = "Tooltip";

export { TooltipComponent as Tooltip };
