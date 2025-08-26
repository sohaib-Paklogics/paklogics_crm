import * as React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export type ConfirmDialogVariant = "default" | "destructive";

interface ConfirmDialogProps {
  /** Optional trigger button/link/etc. If omitted, control via `open` + `onOpenChange`. */
  trigger?: React.ReactNode;

  /** Controlled open state (optional). If provided, component becomes controlled. */
  open?: boolean;
  /** Controlled open change handler (optional). */
  onOpenChange?: (open: boolean) => void;

  /** Heading text */
  title?: string;
  /** Subtext */
  description?: string;

  /** Confirm button label */
  confirmText?: string;
  /** Cancel button label */
  cancelText?: string;

  /** Style intent for confirm button */
  variant?: ConfirmDialogVariant;

  /** Called on confirm. If it returns a Promise, a loading state is shown until it settles. */
  onConfirm: () => void | Promise<void>;

  /** Disable confirm button (e.g., external validation) */
  confirmDisabled?: boolean;
  /** Optional className passthrough for the Confirm button */
  confirmClassName?: string;
  /** Optional className passthrough for the root content */
  contentClassName?: string;
}

export default function ConfirmDialog({
  trigger,
  open,
  onOpenChange,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  confirmDisabled,
  confirmClassName,
  contentClassName,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = typeof open === "boolean";
  const actualOpen = isControlled ? open! : internalOpen;

  const [isLoading, setIsLoading] = React.useState(false);

  const handleOpenChange = (next: boolean) => {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
  };

  const handleConfirm = async () => {
    try {
      const maybePromise = onConfirm?.();
      if (maybePromise && typeof (maybePromise as any).then === "function") {
        setIsLoading(true);
        await maybePromise;
      }
      handleOpenChange(false);
    } catch {
      // Keep dialog open on error; caller can toast/log
    } finally {
      setIsLoading(false);
    }
  };

  const confirmVariantClasses =
    variant === "destructive"
      ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
      : "bg-primary text-primary-foreground hover:bg-primary/90";

  return (
    <AlertDialog open={actualOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : null}

      <AlertDialogContent className={cn("sm:max-w-[480px]", contentClassName)}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!!confirmDisabled || isLoading}
            className={cn(
              "inline-flex items-center justify-center gap-2 px-3 h-9 rounded-md text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-1",
              confirmVariantClasses,
              confirmClassName
            )}
          >
            {isLoading && (
              <svg
                className="mr-1 h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
