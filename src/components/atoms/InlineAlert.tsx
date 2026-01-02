import { cn } from "@/lib/utils";
import type { AlertKind, AlertScope } from "@/lib/types/thumbnails";

export interface InlineAlertProps {
  scope: AlertScope;
  kind: AlertKind;
  message: string;
  isVisible?: boolean;
  className?: string;
}

const alertStyles = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  success: "bg-green-50 border-green-200 text-green-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  error: "bg-red-50 border-red-200 text-red-800",
} as const;

export const InlineAlert = ({
  scope,
  kind,
  message,
  isVisible = true,
  className,
}: InlineAlertProps) => {
  const isError = kind === "error";
  const role = isError ? "alert" : "status";
  const ariaLive = isError ? "assertive" : "polite";

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={cn(
        "h-10 flex items-center rounded-md border px-3 text-sm transition-opacity duration-200",
        alertStyles[kind],
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
    >
      {message}
    </div>
  );
};
