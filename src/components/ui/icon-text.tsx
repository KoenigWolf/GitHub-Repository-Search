import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconTextProps {
  icon: LucideIcon;
  children: React.ReactNode;
  title?: string;
  className?: string;
  iconClassName?: string;
}

export function IconText({
  icon: Icon,
  children,
  title,
  className,
  iconClassName,
}: IconTextProps) {
  return (
    <span className={cn("flex items-center gap-1", className)} title={title}>
      <Icon className={cn("h-4 w-4", iconClassName)} aria-hidden="true" />
      {children}
    </span>
  );
}
