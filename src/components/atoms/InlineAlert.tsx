import { cn } from "@/lib/utils";
import type { AlertKind, AlertScope } from "@/lib/types/thumbnails";

export interface InlineAlertProps {
  scope: AlertScope;
  kind: AlertKind;
  message: string;
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
        "rounded-md border p-3 text-sm",
        alertStyles[kind],
        className
      )}
    >
      {message}
    </div>
  );
};
