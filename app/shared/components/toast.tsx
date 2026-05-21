import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  forwardRef,
} from "react";
import type { ComponentProps, ReactNode } from "react";
import {
  Provider,
  Root,
  Title,
  Description,
  Close,
  Viewport,
  Action,
} from "@radix-ui/react-toast";
import { cn } from "~/lib/utils";
import { Button } from "~/components/atoms/button";
import { X } from "~/components/icons/x";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toast: (props: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                   */
/* -------------------------------------------------------------------------- */

const ToastContext = createContext<ToastContextValue | null>(null);

function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Variants                                                                  */
/* -------------------------------------------------------------------------- */

const toastViewportPositions = {
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
} as const;

type ToastPosition = keyof typeof toastViewportPositions;

const toastColorVariants: Record<ToastVariant, string> = {
  default: "border-border bg-card text-card-foreground",
  success: "border-success/30 bg-success/10 text-success",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  warning: "border-warning/30 bg-warning/10 text-warning-foreground",
  info: "border-info/30 bg-info/10 text-info",
};

/* -------------------------------------------------------------------------- */
/*  Toast Item                                                                */
/* -------------------------------------------------------------------------- */

interface ToastItemProps extends ComponentProps<typeof Root> {
  variant?: ToastVariant;
  onClose?: () => void;
}

const ToastItem = forwardRef<HTMLLIElement, ToastItemProps>(
  ({ className, variant = "default", children, onClose, ...props }, ref) => (
    <Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-hide data-[state=open]:animate-slide-in data-[swipe=end]:animate-swipe-out data-[swipe=cancel]:transition-[transform_200ms_ease-out]",
        toastColorVariants[variant],
        className,
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <Close onClick={onClose} asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-md opacity-70 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </Close>
      )}
    </Root>
  ),
);
ToastItem.displayName = "ToastItem";

/* -------------------------------------------------------------------------- */
/*  Toast Provider                                                            */
/* -------------------------------------------------------------------------- */

interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
}

function ToastProvider({
  children,
  position = "bottom-right",
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...props, id }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({ toast: addToast, dismiss }),
    [addToast, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      <Provider swipeDirection="right" duration={5000}>
        {children}

        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            variant={t.variant}
            duration={t.duration ?? 5000}
            onClose={() => dismiss(t.id)}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id);
            }}
          >
            {t.title && (
              <Title className="font-medium text-sm">{t.title}</Title>
            )}
            {t.description && (
              <Description className="text-sm opacity-90 mt-1">
                {t.description}
              </Description>
            )}
            {t.action && (
              <Action asChild altText={t.action.label}>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={t.action.onClick}
                >
                  {t.action.label}
                </Button>
              </Action>
            )}
          </ToastItem>
        ))}

        <Viewport
          className={cn(
            "fixed z-100 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-100",
            toastViewportPositions[position],
          )}
        />
      </Provider>
    </ToastContext.Provider>
  );
}

export { ToastProvider, useToast };
export type { Toast, ToastVariant, ToastPosition, ToastProviderProps };
