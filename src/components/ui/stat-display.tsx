import { memo } from "react";
import { type LucideIcon } from "lucide-react";
import { IconText } from "@/components/ui/icon-text";
import { formatNumber } from "@/lib/utils";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";

interface StatDisplayProps {
  icon: LucideIcon;
  value: number;
  title: string;
  suffix: string;
  locale?: Locale;
}

export const StatDisplay = memo(function StatDisplay({
  icon,
  value,
  title,
  suffix,
  locale = DEFAULT_LOCALE,
}: StatDisplayProps) {
  return (
    <IconText icon={icon} title={title}>
      <span aria-label={`${value} ${suffix}`}>
        {formatNumber(value, locale)}
      </span>
    </IconText>
  );
});
