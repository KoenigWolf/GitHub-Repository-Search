import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  iconClassName?: string;
  locale?: Locale;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  iconClassName,
  locale = DEFAULT_LOCALE,
}: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <Icon className={cn("h-8 w-8", iconClassName)} />
      <div>
        <div className="text-2xl font-bold">{formatNumber(value, locale)}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
}
