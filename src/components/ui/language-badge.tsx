import { memo } from "react";
import { LANGUAGE_COLORS, DEFAULT_LANGUAGE_COLOR } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LanguageBadgeProps {
  language: string;
  className?: string;
}

export const LanguageBadge = memo(function LanguageBadge({
  language,
  className,
}: LanguageBadgeProps) {
  return (
    <span className={cn("flex items-center gap-1", className)}>
      <span
        className="h-3 w-3 rounded-full"
        style={{
          backgroundColor: LANGUAGE_COLORS[language] ?? DEFAULT_LANGUAGE_COLOR,
        }}
        aria-hidden="true"
      />
      {language}
    </span>
  );
});
