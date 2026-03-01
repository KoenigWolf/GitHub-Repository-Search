import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  iconClassName?: string;
}

export function StatCard({ icon: Icon, value, label, iconClassName }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <Icon className={cn("h-8 w-8", iconClassName)} />
      <div>
        <div className="text-2xl font-bold">{formatNumber(value)}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
}
