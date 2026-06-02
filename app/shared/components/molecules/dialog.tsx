import type { ComponentProps, ReactNode } from "react";

import { createContext, forwardRef, useContext, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { useEscapeKey } from "~/shared/hooks";
import { cn } from "~/shared/utils";

const dialogSizes = {
  fullscreen: "max-w-full h-full",
  lg: "max-w-lg",
  md: "max-w-md",
  sm: "max-w-sm",
  xl: "max-w-xl",
} as const;

interface DialogContextValue {
  descriptionId: string;
  titleId: string;
}

type DialogSize = keyof typeof dialogSizes;

const DialogContext = createContext<DialogContextValue>({
  descriptionId: "",
  titleId: "",
});

interface DialogContentProps extends ComponentProps<"div"> {
  size?: DialogSize;
}

interface DialogProps {
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

function Dialog({ children, onOpenChange, open }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEscapeKey(() => onOpenChange(false), open);

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Tab" && dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      setTimeout(() => {
        const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        firstFocusable?.focus();
      }, 0);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <DialogContext.Provider value={{ descriptionId, titleId }}>
        <div
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          aria-modal="true"
          className="relative z-50 w-full"
          ref={dialogRef}
          role="dialog"
        >
          {children}
        </div>
      </DialogContext.Provider>
    </div>,
    document.body,
  );
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, className, size = "md", ...props }, ref) => (
    <div
      className={cn(
        "border-border bg-card text-card-foreground mx-auto rounded-lg border shadow-xl",
        dialogSizes[size],
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ),
);
DialogContent.displayName = "DialogContent";

const DialogHeader = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div className={cn("flex flex-col gap-1.5 p-6 pb-0", className)} ref={ref} {...props} />
  ),
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = forwardRef<HTMLHeadingElement, ComponentProps<"h2">>(
  ({ className, ...props }, ref) => {
    const { titleId } = useContext(DialogContext);
    return (
      <h2
        className={cn("text-lg leading-none font-semibold tracking-tight", className)}
        id={titleId}
        ref={ref}
        {...props}
      />
    );
  },
);
DialogTitle.displayName = "DialogTitle";

function DialogDescription({ className, ...props }: ComponentProps<"p">) {
  const { descriptionId } = useContext(DialogContext);
  return (
    <p className={cn("text-muted-foreground text-sm", className)} id={descriptionId} {...props} />
  );
}
DialogDescription.displayName = "DialogDescription";

const DialogBody = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => <div className={cn("p-6", className)} ref={ref} {...props} />,
);
DialogBody.displayName = "DialogBody";

const DialogFooter = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("flex items-center justify-end gap-2 p-6 pt-0", className)}
      ref={ref}
      {...props}
    />
  ),
);
DialogFooter.displayName = "DialogFooter";

export {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
};
export type { DialogContentProps, DialogProps, DialogSize };
