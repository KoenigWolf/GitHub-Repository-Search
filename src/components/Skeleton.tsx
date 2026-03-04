import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden="true"
    />
  );
}

interface SkeletonContainerProps {
  children: ReactNode;
  className?: string;
  label?: string;
  locale?: Locale | undefined;
}

function SkeletonContainer({
  children,
  className,
  label,
  locale = DEFAULT_LOCALE,
}: SkeletonContainerProps) {
  const resolvedLabel = label ?? getMessages(locale).loading;
  return (
    <div className={className} aria-busy="true" aria-label={resolvedLabel}>
      {children}
    </div>
  );
}

function RepositoryCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

interface SkeletonComponentProps {
  locale?: Locale;
}

export function SearchResultsSkeleton({ locale }: SkeletonComponentProps = {}) {
  return (
    <SkeletonContainer className="space-y-6" locale={locale}>
      <Skeleton className="h-5 w-48" />
      <div className="space-y-4">
        {Array.from({ length: UI.SKELETON_ITEM_COUNT }).map((_, i) => (
          <RepositoryCardSkeleton key={`skeleton-card-${i}`} />
        ))}
      </div>
    </SkeletonContainer>
  );
}

export function SearchFormSkeleton({ locale = DEFAULT_LOCALE }: SkeletonComponentProps = {}) {
  const m = getMessages(locale);
  return (
    <SkeletonContainer
      className="flex flex-col gap-4 sm:flex-row sm:items-center"
      label={m.loadingSearchForm}
      locale={locale}
    >
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-full sm:w-40" />
      <Skeleton className="h-10 w-full sm:w-24" />
    </SkeletonContainer>
  );
}

export function RepositoryDetailSkeleton({ locale }: SkeletonComponentProps = {}) {
  return (
    <SkeletonContainer className="space-y-6" locale={locale}>
      <Skeleton className="h-8 w-32" />
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: UI.SKELETON_STAT_CARD_COUNT }).map((_, i) => (
          <Skeleton key={`skeleton-stat-${i}`} className="h-24 rounded-lg" />
        ))}
      </div>
    </SkeletonContainer>
  );
}
