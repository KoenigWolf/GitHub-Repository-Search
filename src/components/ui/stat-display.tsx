import { memo } from "react";
import { type LucideIcon } from "lucide-react";
import { IconText } from "@/components/ui/icon-text";
import { formatNumber } from "@/lib/utils";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

interface StatDisplayProps {
  icon: LucideIcon;
  value: number;
  title: string;
  locale?: Locale;
}

export const StatDisplay = memo(function StatDisplay({
  icon,
  value,
  title,
  locale = DEFAULT_LOCALE,
}: StatDisplayProps) {
  const formatted = formatNumber(value, locale);
  return (
    <IconText icon={icon} title={title}>
      {formatted}
    </IconText>
  );
});
