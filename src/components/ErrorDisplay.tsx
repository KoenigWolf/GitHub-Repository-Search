import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  title?: string;
}

export function ErrorDisplay({
  message,
  title = "エラーが発生しました",
}: ErrorDisplayProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        <div>
          <h2 className="font-semibold text-red-800 dark:text-red-200">
            {title}
          </h2>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
