# リファクタリング記録

このドキュメントは、GitHub Repository Search アプリケーションに対して実施したリファクタリングの全記録です。

## 概要

- **テスト数**: 55 → 72 (+17 テスト)
- **削除したコード**: 131行 (未使用の hooks/useSearch.ts)
- **新規コンポーネント**: 6個
- **新規ユーティリティ**: 2ファイル

---

## 1. BackButton コンポーネントの作成

**目的**: リポジトリ詳細ページから検索結果一覧への戻るナビゲーション

**ファイル**: `src/components/BackButton.tsx` (新規作成)

**実装内容**:
- `document.referrer` を使用した同一オリジンチェック
- 同一オリジンなら `router.back()`、そうでなければ `fallbackHref` へ遷移
- アクセシビリティ対応 (`aria-label`)

```tsx
"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function canGoBack(): boolean {
  if (typeof window === "undefined") return false;
  const referrer = document.referrer;
  if (!referrer) return false;
  try {
    const referrerUrl = new URL(referrer);
    return referrerUrl.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function BackButton({
  fallbackHref = "/search",
  children = "検索に戻る"
}) {
  const router = useRouter();
  const handleClick = () => {
    if (canGoBack()) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleClick}
      aria-label="検索結果一覧に戻る"
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Button>
  );
}
```

**テスト**: `src/test/BackButton.test.tsx` (7 テスト)

---

## 2. buttonVariants 関数の追加

**目的**: ボタンスタイルを非 Button 要素（`<a>` タグなど）でも再利用可能に

**ファイル**: `src/components/ui/button.tsx` (修正)

**実装内容**:
```tsx
interface ButtonVariantOptions {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function buttonVariants({
  variant = "default",
  size = "md",
  className
}: ButtonVariantOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );
}
```

**使用例**: リポジトリ詳細ページの「GitHubで開く」リンク

---

## 3. UI 定数の集約

**目的**: マジックナンバーの排除と一元管理

**ファイル**: `src/lib/constants.ts` (修正)

**追加内容**:
```tsx
export const UI = {
  MAX_TOPICS_DISPLAY: 5,
  SKELETON_ITEM_COUNT: 5,
  PAGINATION_DELTA: 1,
  ANNOUNCEMENT_CLEAR_DELAY_MS: 1000,
} as const;

export const SORT_OPTIONS = [
  { value: "best-match", label: "ベストマッチ" },
  { value: "stars", label: "スター数" },
  { value: "forks", label: "フォーク数" },
  { value: "updated", label: "更新日" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
```

**影響を受けたファイル**:
- `RepositoryCard.tsx`
- `RepositoryTopics.tsx`
- `Skeleton.tsx`
- `LiveRegion.tsx`
- `Pagination.tsx`
- `SearchForm.tsx`

---

## 4. Card コンポーネントの作成

**目的**: カードスタイルの統一と再利用

**ファイル**: `src/components/ui/card.tsx` (新規作成)

**実装内容**:
```tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, as: Component = "div", hover = false, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "rounded-lg border border-border bg-card",
          hover && "transition-shadow hover:shadow-md",
          className
        )}
        {...props}
      />
    );
  }
);
```

**使用箇所**:
- `RepositoryCard.tsx`
- `StatCard.tsx`
- `Skeleton.tsx`
- リポジトリ詳細ページ

---

## 5. IconText コンポーネントの作成

**目的**: アイコン + テキストパターンの統一

**ファイル**: `src/components/ui/icon-text.tsx` (新規作成)

**実装内容**:
```tsx
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
```

**使用箇所**:
- `RepositoryCard.tsx`
- リポジトリ詳細ページ

---

## 6. StatCard コンポーネントの作成

**目的**: 統計情報カードの共通化

**ファイル**: `src/components/ui/stat-card.tsx` (新規作成)

**実装内容**:
```tsx
interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  iconClassName?: string;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  iconClassName
}: StatCardProps) {
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
```

---

## 7. RepositoryTopics コンポーネントの作成

**目的**: トピックタグ表示の共通化

**ファイル**: `src/components/RepositoryTopics.tsx` (新規作成)

**実装内容**:
```tsx
interface RepositoryTopicsProps {
  topics: string[];
  maxDisplay?: number;
  showTitle?: boolean;
}

export function RepositoryTopics({
  topics,
  maxDisplay = UI.MAX_TOPICS_DISPLAY,
  showTitle = false,
}: RepositoryTopicsProps) {
  if (topics.length === 0) return null;

  const displayedTopics = topics.slice(0, maxDisplay);
  const remainingCount = topics.length - maxDisplay;

  return (
    <div className="space-y-2">
      {showTitle && (
        <h2 className="text-lg font-semibold">トピック</h2>
      )}
      <div className="flex flex-wrap gap-1">
        {displayedTopics.map((topic) => (
          <Badge key={topic} variant="secondary">
            {topic}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline">+{remainingCount}</Badge>
        )}
      </div>
    </div>
  );
}
```

---

## 8. EmptyState コンポーネントの作成

**目的**: 空状態表示の統一

**ファイル**: `src/components/EmptyState.tsx` (新規作成)

**実装内容**:
```tsx
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({
  icon: Icon = Search,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/50" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
```

---

## 9. validators.ts の作成

**目的**: 入力値の正規化ロジックの集約

**ファイル**: `src/lib/validators.ts` (新規作成)

**実装内容**:
```tsx
export function normalizeQuery(query: unknown): string {
  if (typeof query !== "string") return "";
  return query.trim();
}

export function normalizePageNumber(page: unknown): number {
  if (typeof page === "number" && Number.isInteger(page) && page >= 1) {
    return page;
  }
  if (typeof page === "string") {
    const parsed = parseInt(page, 10);
    if (!Number.isNaN(parsed) && parsed >= 1) {
      return parsed;
    }
  }
  return 1;
}

export function normalizeSortParam(sort: unknown): SortValue {
  const validSorts: SortValue[] = ["best-match", "stars", "forks", "updated"];
  if (typeof sort === "string" && validSorts.includes(sort as SortValue)) {
    return sort as SortValue;
  }
  return "best-match";
}
```

**テスト**: `src/test/validators.test.ts` (10 テスト)

---

## 10. pagination.ts の作成

**目的**: ページネーション計算ロジックの分離

**ファイル**: `src/lib/pagination.ts` (新規作成)

**実装内容**:
```tsx
export interface PageItem {
  type: "page" | "ellipsis";
  value: number;
}

export function calculatePageNumbers(
  currentPage: number,
  totalPages: number,
  delta: number = UI.PAGINATION_DELTA
): PageItem[] {
  const items: PageItem[] = [];
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  items.push({ type: "page", value: 1 });

  if (left > 2) {
    items.push({ type: "ellipsis", value: left - 1 });
  }

  for (let i = left; i <= right; i++) {
    items.push({ type: "page", value: i });
  }

  if (right < totalPages - 1) {
    items.push({ type: "ellipsis", value: right + 1 });
  }

  if (totalPages > 1) {
    items.push({ type: "page", value: totalPages });
  }

  return items;
}
```

**テスト**: `src/test/pagination.test.ts` (7 テスト)

---

## 11. 未使用コードの削除

**目的**: デッドコードの除去

**削除ファイル**: `src/hooks/useSearch.ts` (131行)

**理由**: URL ベースの状態管理に移行後、使用されなくなった hooks

---

## 12. Skeleton コンポーネントの移動・統合

**目的**: スケルトンコンポーネントの一元管理

**ファイル**: `src/components/Skeleton.tsx` (修正)

**変更内容**:
- `RepositoryDetailSkeleton` をリポジトリ詳細ページから移動
- Card コンポーネントを使用するように更新

---

## ファイル構成（リファクタリング後）

```text
src/
├── components/
│   ├── ui/
│   │   ├── badge.tsx
│   │   ├── button.tsx        # buttonVariants 追加
│   │   ├── card.tsx          # 新規作成
│   │   ├── icon-text.tsx     # 新規作成
│   │   └── stat-card.tsx     # 新規作成
│   ├── BackButton.tsx        # 新規作成
│   ├── EmptyState.tsx        # 新規作成
│   ├── ErrorDisplay.tsx
│   ├── LiveRegion.tsx
│   ├── Pagination.tsx
│   ├── RepositoryCard.tsx
│   ├── RepositoryTopics.tsx  # 新規作成
│   ├── SearchForm.tsx
│   ├── SearchResults.tsx
│   └── Skeleton.tsx          # 統合
├── lib/
│   ├── api/
│   │   └── github-client.ts
│   ├── schemas/
│   │   └── github.ts
│   ├── constants.ts          # UI 定数追加
│   ├── pagination.ts         # 新規作成
│   ├── utils.ts
│   └── validators.ts         # 新規作成
└── test/
    ├── BackButton.test.tsx   # 新規作成
    ├── pagination.test.ts    # 新規作成
    ├── validators.test.ts    # 新規作成
    └── ...
```

---

## 効果まとめ

| 指標 | Before | After | 改善 |
|------|--------|-------|------|
| テスト数 | 55 | 72 | +17 |
| テストカバレッジ | - | バリデーション、ページネーション、BackButton をカバー | - |
| 重複コード | カードスタイル 4箇所、アイコンテキスト 6箇所 | Card 1箇所、IconText 1箇所 | 大幅削減 |
| マジックナンバー | 散在 | constants.ts に集約 | 保守性向上 |
| 未使用コード | 131行 | 0行 | 131行削減 |

---

## 今後の改善候補

1. **コンポーネントテストの拡充**: Card, IconText, StatCard のユニットテスト
2. **E2E テスト**: 検索→詳細→戻るフローのテスト
3. **パフォーマンス**: React.memo の適用検討
4. **アクセシビリティ**: axe-core による自動テスト導入
