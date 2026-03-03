import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

interface ErrorPanelProps {
  title?: string;
  message: string;
  digest?: string | undefined;
  variant?: "inline" | "centered";
  children?: React.ReactNode;
  locale?: Locale;
}

export function ErrorPanel({
  title,
  message,
  digest,
  variant = "centered",
  children,
  locale = DEFAULT_LOCALE,
}: ErrorPanelProps) {
  const m = getMessages(locale);
  const resolvedTitle = title ?? m.genericErrorTitle;
  const isInline = variant === "inline";

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950",
        isInline ? "p-6" : "max-w-md p-8 text-center"
      )}
    >
      <div className={cn(isInline && "flex items-start gap-3")}>
        <AlertCircle
          className={cn(
            "text-red-600 dark:text-red-400",
            isInline ? "h-5 w-5 shrink-0" : "mx-auto h-12 w-12"
          )}
        />
        <div>
          <h2
            className={cn(
              "font-semibold text-red-800 dark:text-red-200",
              isInline ? "" : "mt-4 text-lg"
            )}
          >
            {resolvedTitle}
          </h2>
          <p
            className={cn(
              "text-sm text-red-700 dark:text-red-300",
              isInline ? "mt-1" : "mt-2"
            )}
          >
            {message}
          </p>
          {digest && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {m.errorIdLabel} {digest}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
