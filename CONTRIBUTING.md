# Contributing Guide

## Development Setup

```bash
npm install
npm run dev
```

## Code Style

### TypeScript

- `strict: true` を維持
- `any` 禁止、必要なら `unknown` を使用
- 型推論に頼りすぎず、パブリック API は明示的に型付け

### コンポーネント

```typescript
// Good: Props インターフェースを定義
interface SearchFormProps {
  locale?: Locale;
  initialQuery?: string;
  initialSort?: SortValue;
}

export function SearchForm({
  locale = DEFAULT_LOCALE,
  initialQuery = "",
  initialSort = "best-match",
}: SearchFormProps) {
  // ...
}

// Good: メモ化は名前付き関数で
export const RepositoryCard = memo(function RepositoryCard(props) {
  // ...
});
```

### SSR とハイドレーション

Server Component から Client Component へ初期値を渡し、ハイドレーションミスマッチを防ぐ:

```typescript
// ❌ Bad: Client で URL パラメータから初期化
// サーバーとクライアントで値が異なる
const [query, setQuery] = useState(searchParams.get("q") ?? "");

// ✅ Good: Server から props で初期値を渡す
// SearchPage.tsx (Server Component)
<SearchForm initialQuery={query} initialSort={sort} />

// SearchForm.tsx (Client Component)
const [query, setQuery] = useState(initialQuery);
```

### suppressHydrationWarning の使い分け

```typescript
// ✅ Good: ブラウザ拡張機能による変更を許容
// html 要素: VS Code 拡張等が style 属性を追加する
<html lang="ja" suppressHydrationWarning>

// フォーム要素: パスワードマネージャー等が data-* 属性を追加する
<form suppressHydrationWarning>
  <input suppressHydrationWarning />
  <select suppressHydrationWarning />
  <button suppressHydrationWarning />
</form>

// ❌ Bad: SSR/CSR の値の違いを隠す
// 根本原因を解決すべき
const [value, setValue] = useState(window.location.search); // 修正が必要
```

### null / undefined の扱い

```typescript
// Good: ブラウザ API の null を受け入れる
export function normalizeSortParam(value: string | null | undefined): SortValue

// Good: オプショナルパラメータにはデフォルト値
export function formatNumber(num: number, locale?: Locale): string {
  const targetLocale = locale ?? DEFAULT_LOCALE;
}

// Bad: null を undefined に変換する冗長なコード
normalizeSortParam(getParam("sort") ?? undefined)
```

### エラーハンドリング

```typescript
// Good: Result 型で明示的に
const result = await searchRepositories({ query });
if (!result.success) {
  const messageKey = ERROR_CODE_MESSAGE_KEYS[result.error.code];
  return <ErrorPanel message={m[messageKey]} />;
}

// Bad: try-catch で握りつぶす
try {
  const data = await fetchData();
} catch {
  // エラー無視
}
```

### 型ガード

`unknown` 型を絞り込む際は型ガードを使用:

```typescript
// Good: 型ガードで型を絞り込む
function isRetryableError(error: unknown): error is Error {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.name === "AbortError" || error.name === "TypeError";
}

// 使用側で型が絞り込まれる
if (isRetryableError(error)) {
  console.log(error.message); // Error 型として扱える
}
```

### コメント

リーダブルコードの原則に従い、不要なコメントは書かない:

```typescript
// Bad: コードで自明
// ページ番号を正規化する
export function normalizePageNumber(pageStr: string): number

// Good: コメント不要、関数名が説明
export function normalizePageNumber(pageStr: string): number

// Good: 外部リソースへの参照は残す
/** @see https://github.com/ozh/github-colors */
export const LANGUAGE_COLORS = { ... }
```

## Testing

```bash
npm test              # ウォッチモード
npm run test:run      # 単発実行
npm run test:coverage # カバレッジ
```

### テストの書き方

```typescript
describe("normalizePageNumber", () => {
  it("有効な数値文字列を数値に変換する", () => {
    expect(normalizePageNumber("5")).toBe(5);
  });

  it("無効な値は 1 を返す", () => {
    expect(normalizePageNumber("invalid")).toBe(1);
    expect(normalizePageNumber("-1")).toBe(1);
  });
});
```

## Git Workflow

1. `main` から機能ブランチを作成
2. 変更をコミット（日本語 OK）
3. PR を作成
4. レビュー後マージ

### ブランチ命名

- `feat/機能名` - 新機能
- `fix/修正内容` - バグ修正
- `refactor/対象` - リファクタリング
- `docs/対象` - ドキュメント
- `chore/対象` - 設定・依存関係

## Pull Request

- 変更の目的を明記
- テストが通ることを確認
- 必要に応じてスクリーンショット添付
