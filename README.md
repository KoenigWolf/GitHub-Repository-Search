# GitHub Repository Search

GitHub のリポジトリを検索・閲覧できる Web アプリケーションです。

## セットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定（任意）
cp .env.local.example .env.local
# .env.local を編集して GITHUB_TOKEN を設定

# 開発サーバーの起動
npm run dev

# テストの実行
npm test

# カバレッジ付きテスト
npm run test:coverage

# 全チェック（lint + typecheck + test + build）
npm run check-all

# ビルド
npm run build
```

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| GITHUB_TOKEN | 任意 | GitHub Personal Access Token。設定するとレート制限が 60 req/h から 5,000 req/h に緩和されます。 |

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **UI ライブラリ**: React 19
- **言語**: TypeScript (strictモード + exactOptionalPropertyTypes)
- **バリデーション**: Zod
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **テスト**: Vitest, Testing Library
- **リンター**: ESLint 9 (Flat Config)
- **ユーティリティ**: clsx, tailwind-merge

## アーキテクチャ

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                   # ルートレイアウト（ヘッダー含む）
│   ├── page.tsx                     # ルートページ（/search にリダイレクト）
│   ├── not-found.tsx                # 404 ページ
│   ├── globals.css                  # グローバルスタイル・CSS 変数
│   ├── search/
│   │   └── page.tsx                 # 検索ページ（Server Component）
│   └── repositories/[owner]/[repo]/
│       └── page.tsx                 # リポジトリ詳細ページ
├── components/
│   ├── ui/                          # 汎用 UI コンポーネント
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   └── select.tsx
│   ├── SearchForm.tsx               # 検索フォーム（Client Component）
│   ├── RepositoryCard.tsx           # リポジトリカード
│   ├── RepositoryList.tsx           # リポジトリ一覧
│   ├── Pagination.tsx               # ページネーション（Client Component）
│   ├── Skeleton.tsx                 # ローディングスケルトン
│   ├── ErrorDisplay.tsx             # エラー表示
│   ├── ErrorBoundary.tsx            # エラー境界（HOC対応）
│   └── LiveRegion.tsx               # スクリーンリーダー向けライブリージョン
├── hooks/
│   └── useSearch.ts                 # 検索パラメータ・ページネーション hooks
├── lib/
│   ├── api/
│   │   └── github-client.ts         # GitHub API クライアント（Result型）
│   ├── schemas/
│   │   └── github.ts                # Zod スキーマ・型定義
│   ├── result.ts                    # Result 型（関数型エラーハンドリング）
│   ├── constants.ts                 # 定数（言語カラー、API設定）
│   └── utils.ts                     # ユーティリティ関数
└── test/
    ├── setup.ts                     # テストセットアップ
    ├── fixtures.ts                  # テスト用モックデータ
    ├── github.test.ts               # API クライアントテスト
    ├── utils.test.ts                # ユーティリティテスト
    ├── RepositoryCard.test.tsx      # コンポーネントテスト
    ├── SearchForm.test.tsx
    └── Pagination.test.tsx
```

## 設計パターン

### Result 型による関数型エラーハンドリング

try-catch ではなく Result 型（`Success<T> | Failure<E>`）を使用した関数型のエラーハンドリングを採用しています。

```typescript
const result = await searchRepositories({ query: "react" });

if (!result.success) {
  // 型安全にエラーを処理
  console.error(result.error.code, result.error.message);
  return;
}

// result.data は SearchResult 型として型推論される
console.log(result.data.repositories);
```

### Zod によるランタイムバリデーション

GitHub API のレスポンスを Zod スキーマで検証し、型安全性を実行時にも担保しています。

```typescript
export const GitHubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  // ...
});

export type GitHubRepository = z.infer<typeof GitHubRepositorySchema>;
```

## 工夫した点・拘りポイント

### Server Components と Client Components の適切な分離

Next.js 15 の App Router を活用し、データフェッチが必要なコンポーネント（RepositoryList, RepositoryCard など）は Server Component として実装しました。一方、ユーザーインタラクションが必要な SearchForm や Pagination は Client Component として分離しています。これにより、初期ロード時の JavaScript バンドルサイズを最小化しつつ、必要な部分でのみクライアントサイドの機能を提供しています。

### 型安全な API クライアント設計

Result 型パターンと Zod バリデーションを組み合わせ、API レスポンスの型安全性を実行時まで担保しています。エラーコード（`NETWORK_ERROR`, `RATE_LIMIT`, `NOT_FOUND`, `VALIDATION_ERROR`）による分岐で、適切なエラーメッセージを表示できます。

### アクセシビリティへの配慮

- WAI-ARIA: `role="search"`, `aria-label`, `aria-current="page"` など
- LiveRegion: 検索結果件数をスクリーンリーダーにアナウンス
- ErrorBoundary: 予期せぬエラー時のフォールバック UI

### レスポンシブデザインとダークモード対応

Tailwind CSS の CSS 変数を活用したカラーシステムにより、システムのダークモード設定に自動追従します。また、モバイルファーストのレスポンシブレイアウトで、様々なデバイスサイズに対応しています。

### テスタビリティを考慮した設計

Vitest と Testing Library を用いた包括的なテストスイートを実装しました。モックを活用した API クライアントのテスト、ユーザーイベントシミュレーションによるコンポーネントテストなど、48 件のテストケースでコードの品質を担保しています。

## 既知の制限事項

- **検索結果の上限**: GitHub Search API は最大 1,000 件（約 34 ページ）までの結果しか返しません
- **レート制限**:
  - 認証なし: 60 リクエスト/時間
  - 認証あり: 5,000 リクエスト/時間
- **キャッシュ**: 検索結果は 60 秒、リポジトリ詳細は 300 秒のキャッシュが設定されています
