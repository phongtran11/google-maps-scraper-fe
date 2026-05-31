import { memo, useState, useEffect, useRef, useId, Children, cloneElement } from "react";
import type { ReactNode, ReactElement, Ref, MouseEvent, FocusEvent } from "react";
import { createPortal } from "react-dom";
import { cn } from "~/shared/utils";
import { useEscapeKey } from "~/shared/hooks";

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  delay?: number;
  className?: string;
}

const TooltipComponent = memo(function Tooltip({
  content,
  children,
  delay = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const showTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
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
        top: rect.top,
        left: rect.left + rect.width / 2,
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
    ref?: Ref<HTMLElement>;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
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
    ref: handleRef,
    "aria-describedby": isVisible ? tooltipId : undefined,
    onMouseEnter: (e: MouseEvent) => {
      child.props.onMouseEnter?.(e);
      showTooltip();
    },
    onMouseLeave: (e: MouseEvent) => {
      child.props.onMouseLeave?.(e);
      hideTooltip();
    },
    onFocus: (e: FocusEvent) => {
      child.props.onFocus?.(e);
      showTooltip();
    },
    onBlur: (e: FocusEvent) => {
      child.props.onBlur?.(e);
      hideTooltip();
    },
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
            id={tooltipId}
            style={{
              position: "fixed",
              top: `${coords.top - 6}px`,
              left: `${coords.left}px`,
              transform: "translate(-50%, -100%)",
              zIndex: 9999,
            }}
            className={cn(
              "bg-popover text-popover-foreground border-border animate-in fade-in zoom-in-95 max-w-[280px] rounded-md border px-3 py-1.5 text-xs leading-relaxed font-normal wrap-break-word shadow-md duration-150 select-none",
              className,
            )}
            role="tooltip"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
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
