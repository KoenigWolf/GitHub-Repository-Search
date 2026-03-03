# Architecture Guide

## Overview

GitHub Repository Search は Next.js App Router を使用した TypeScript アプリケーションです。型安全性、明示的なエラーハンドリング、アクセシビリティを重視した設計になっています。

## Core Principles

### 1. 型ファースト設計

Zod スキーマで実行時バリデーションと型定義を統一:

```typescript
// スキーマから型を導出
export const GitHubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  owner: GitHubOwnerSchema,
});

export type GitHubRepository = z.infer<typeof GitHubRepositorySchema>;
```

### 2. 明示的エラーハンドリング

Result 型による例外を使わないエラー伝播:

```typescript
type Result<T, E> = Success<T> | Failure<E>;

// 使用例
const result = await searchRepositories({ query });
if (!result.success) {
  return <ErrorPanel message={result.error.message} />;
}
const { data } = result;
```

### 3. URL ベースの状態管理

クエリパラメータを状態の源泉とし、ディープリンクと共有を可能に:

```typescript
// サーバーコンポーネントでパラメータを取得
const query = normalizeQuery(normalizeParam(params.q) ?? "");
const page = normalizePageNumber(normalizeParam(params.page) ?? "1");
```

### 4. アクセシビリティファースト

セマンティック HTML と ARIA 属性を徹底:

```typescript
<nav aria-label={m.pagination}>
  <Button aria-current={page === currentPage ? "page" : undefined}>
    {page}
  </Button>
</nav>
```

## Directory Structure

```
src/
├── app/                    # ページ（Server Components）
├── components/             # 再利用可能なコンポーネント
│   └── ui/                 # プリミティブ UI コンポーネント
├── hooks/                  # カスタムフック
├── lib/                    # ユーティリティ・ドメインロジック
│   ├── api/                # 外部 API クライアント
│   └── schemas/            # Zod スキーマ
└── test/                   # テスト
```

## Component Design

### Server vs Client Components

```typescript
// Server Component（デフォルト）- データ取得
export default async function SearchPage({ searchParams }) {
  const result = await searchRepositories({ query });
  return <RepositoryList repositories={result.data.repositories} />;
}

// Client Component - インタラクティブ
"use client";
export function SearchForm({ locale }) {
  const [query, setQuery] = useState("");
  // ...
}
```

### メモ化パターン

高コストなコンポーネントは `memo` でラップ:

```typescript
export const RepositoryCard = memo(function RepositoryCard({
  repository,
  locale = DEFAULT_LOCALE,
}: RepositoryCardProps) {
  // ...
});
```

### UI プリミティブ

`components/ui/` 配下のコンポーネントはバリアント対応:

```typescript
type ButtonVariant = "default" | "destructive" | "outline" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export function buttonVariants({ variant, size, className }) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}
```

## Error Handling

### API エラーコード

```typescript
type GitHubApiErrorCode =
  | "NETWORK_ERROR"    // ネットワーク障害
  | "RATE_LIMIT"       // レート制限
  | "INVALID_QUERY"    // 無効なクエリ
  | "NOT_FOUND"        // リソースなし
  | "VALIDATION_ERROR" // レスポンス検証失敗
  | "UNKNOWN_ERROR";   // その他
```

### リトライ戦略

指数バックオフでリトライ:

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
} as const;

function calculateBackoff(attempt: number): number {
  return Math.min(
    RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt) + Math.random() * 100,
    RETRY_CONFIG.maxDelayMs
  );
}
```

## Naming Conventions

| 種類 | 規則 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `SearchForm`, `RepositoryCard` |
| 関数 | camelCase | `formatNumber`, `normalizeQuery` |
| 定数 | UPPER_SNAKE_CASE | `RATE_LIMIT_WINDOW_MS` |
| 型 | PascalCase | `GitHubRepository`, `SearchResult` |
| Props インターフェース | `*Props` | `ButtonProps`, `SearchFormProps` |
| バリアント型 | `*Variant` / `*Size` | `ButtonVariant`, `ButtonSize` |

## Internationalization

ロケール型とメッセージ関数で多言語対応:

```typescript
export type Locale = "ja-JP" | "en-US";

export function getMessages(locale: Locale) {
  return locale === "en-US" ? messagesEn : messagesJa;
}
```

## Testing Strategy

- **ユニットテスト**: `lib/` 配下の純粋関数
- **コンポーネントテスト**: Testing Library + vitest
- **アクセシビリティテスト**: vitest-axe
- **E2E テスト**: Playwright

## Performance

- Suspense による段階的レンダリング
- `memo` による不要な再レンダリング防止
- `DateTimeFormat` のキャッシュ
- Next.js の ISR によるレスポンスキャッシュ
