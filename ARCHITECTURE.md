# Architecture Guide

## Overview

GitHub Repository Search は Next.js App Router を使用した TypeScript アプリケーションです。型安全性、明示的なエラーハンドリング、アクセシビリティを重視した設計になっています。

## Table of Contents

- [Core Principles](#core-principles)
- [Directory Structure](#directory-structure)
- [Component Design](#component-design)
- [Error Handling](#error-handling)
- [Environment Variables](#environment-variables)
- [Naming Conventions](#naming-conventions)
- [Internationalization](#internationalization)
- [Testing Strategy](#testing-strategy)
- [Performance](#performance)

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
  const params = await searchParams;
  const query = normalizeQuery(normalizeParam(params.q) ?? "");
  const sort = normalizeSortParam(normalizeParam(params.sort));

  return (
    <Suspense fallback={<SearchFormSkeleton />}>
      <SearchForm initialQuery={query} initialSort={sort} />
    </Suspense>
  );
}

// Client Component - インタラクティブ
"use client";
export function SearchForm({ initialQuery = "", initialSort = "best-match" }) {
  const [query, setQuery] = useState(initialQuery);
  // ...
}
```

### Server → Client データ受け渡しパターン

ハイドレーションミスマッチを防ぐため、Server Component から Client Component へ初期値を props で渡す:

```typescript
// ❌ Bad: Client で URL パラメータを読み取り初期化
// → サーバーとクライアントで値が異なりハイドレーションエラー
const [query, setQuery] = useState(getParam("q") ?? "");

// ✅ Good: Server から props で初期値を渡す
// SearchPage (Server) → SearchForm (Client)
<SearchForm initialQuery={query} initialSort={sort} />

const [query, setQuery] = useState(initialQuery);
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
type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
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
  totalTimeoutMs: 30000,
  requestTimeoutMs: 10000,
} as const;

function calculateBackoff(attempt: number): number {
  return Math.min(
    RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt) + Math.random() * 100,
    RETRY_CONFIG.maxDelayMs
  );
}
```

### バリデーションエラーの詳細

レスポンス検証失敗時にエラー種別を区別:

```typescript
// JSON パースエラー
{ type: "JSON_PARSE_ERROR", message: "Failed to parse JSON" }

// スキーマ検証エラー
{ type: "SCHEMA_VALIDATION_ERROR", issues: [...] }
```

### 型ガード

リトライ可能なエラーを型安全に判定:

```typescript
function isRetryableError(error: unknown): error is Error {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    error.name === "AbortError" ||
    error.name === "TypeError" ||
    message.includes("network") ||
    message.includes("timeout")
  );
}
```

## Environment Variables

Zod スキーマで環境変数をバリデーション:

```typescript
const envSchema = z.object({
  GITHUB_TOKEN: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});
```

### キャッシュ戦略

- **本番・開発環境**: 初回パース後にキャッシュ（パフォーマンス最適化）
- **テスト環境**: キャッシュ無効（テスト間で `process.env` を変更可能に）

```typescript
function parseEnv(): EnvType {
  // テスト環境ではキャッシュしない
  if (process.env.NODE_ENV === "test") {
    return envSchema.safeParse(process.env).data;
  }
  // それ以外はキャッシュ
  if (cachedEnv) return cachedEnv;
  cachedEnv = envSchema.safeParse(process.env).data;
  return cachedEnv;
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
