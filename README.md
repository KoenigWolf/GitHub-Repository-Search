# GitHub Repository Search

GitHub のリポジトリを検索・閲覧できる Web アプリケーションです。

## 機能

- GitHub リポジトリの検索（キーワード、ソート順）
- リポジトリ詳細情報の表示
- インスタント検索（入力中にリアルタイム検索）
- 日本語 / 英語の多言語対応（`?lang=en` で切り替え）
- ダークモード対応（システム設定に追従）
- レスポンシブデザイン

## セットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定（任意）
cp .env.local.example .env.local
# .env.local を編集して GITHUB_TOKEN を設定

# 開発サーバーの起動
npm run dev

# テストの実行（ユニットテスト）
npm test

# カバレッジ付きテスト
npm run test:coverage

# E2E テストの実行
npm run test:e2e

# E2E テスト（UI モード）
npm run test:e2e:ui

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

- **フレームワーク**: Next.js 15 (App Router, Edge Runtime)
- **UI ライブラリ**: React 19
- **言語**: TypeScript (strictモード + exactOptionalPropertyTypes)
- **バリデーション**: Zod
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **テスト**: Vitest, Testing Library, Playwright (E2E)
- **リンター**: ESLint 9 (Flat Config)
- **ユーティリティ**: clsx, tailwind-merge
- **国際化**: 独自実装（日本語 / 英語）

## アーキテクチャ

```text
e2e/
└── search.spec.ts                    # E2E テスト（検索・詳細ページ・アクセシビリティ）

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
│   │   ├── badge.tsx
│   │   ├── button.tsx               # buttonVariants 関数含む
│   │   ├── card.tsx                 # 汎用カードコンポーネント
│   │   ├── icon-text.tsx            # アイコン+テキストパターン
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── stat-card.tsx            # 統計情報カード
│   ├── BackButton.tsx               # 戻るボタン（Client Component）
│   ├── EmptyState.tsx               # 空状態表示
│   ├── ErrorDisplay.tsx             # エラー表示
│   ├── Pagination.tsx               # ページネーション（Client Component）
│   ├── RepositoryCard.tsx           # リポジトリカード
│   ├── RepositoryList.tsx           # リポジトリ一覧
│   ├── RepositoryTopics.tsx         # トピックタグ表示
│   ├── SearchForm.tsx               # 検索フォーム（Client Component）
│   └── Skeleton.tsx                 # ローディングスケルトン
├── hooks/
│   ├── useDebounce.ts               # デバウンス用カスタムフック
│   └── useSearchNavigation.ts       # 検索ナビゲーション用フック
├── lib/
│   ├── api/
│   │   └── github-client.ts         # GitHub API クライアント（Result型）
│   ├── schemas/
│   │   └── github.ts                # Zod スキーマ・型定義
│   ├── constants.ts                 # 定数（言語カラー、API設定、UI定数）
│   ├── locale.ts                    # ロケール設定・ユーティリティ
│   ├── messages.ts                  # 多言語メッセージ定義
│   ├── pagination.ts                # ページネーション計算ロジック
│   ├── result.ts                    # Result 型（関数型エラーハンドリング）
│   ├── utils.ts                     # ユーティリティ関数
│   └── validators.ts                # 入力値正規化（query, page, sort）
└── test/
    ├── setup.ts                     # テストセットアップ
    ├── fixtures.ts                  # テスト用モックデータ
    ├── BackButton.test.tsx          # BackButton テスト
    ├── github.test.ts               # API クライアントテスト
    ├── pagination.test.ts           # ページネーション計算テスト
    ├── Pagination.test.tsx          # Pagination コンポーネントテスト
    ├── RepositoryCard.test.tsx      # RepositoryCard テスト
    ├── SearchForm.test.tsx          # SearchForm テスト
    ├── utils.test.ts                # ユーティリティテスト
    └── validators.test.ts           # バリデーターテスト
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

### パフォーマンス最適化

検索体験を高速化するため、複数の最適化を実施しています：

- **Edge Runtime**: 検索ページとリポジトリ詳細ページで Edge Runtime を使用し、コールドスタートを高速化
- **インスタント検索**: 入力中にリアルタイムで検索を実行（400ms デバウンス）
- **useTransition**: React 19 の useTransition を活用し、検索中も UI をブロックしない
- **React.memo**: 頻繁に再レンダリングされるコンポーネント（RepositoryCard, StatCard など）をメモ化
- **Intl.DateTimeFormat キャッシュ**: 日付フォーマッターをキャッシュして再利用
- **最適化されたタイムアウト**: API タイムアウトを調整し、失敗の早期検出を実現

### 多言語対応（i18n）

ライブラリを使用せず、軽量な独自実装で日本語と英語をサポートしています：

- URL パラメータ（`?lang=en`）による言語切り替え
- Server Component / Client Component 両方で動作
- 型安全なメッセージ定義
- デフォルトは日本語

### 型安全な API クライアント設計

Result 型パターンと Zod バリデーションを組み合わせ、API レスポンスの型安全性を実行時まで担保しています。エラーコード（`NETWORK_ERROR`, `RATE_LIMIT`, `NOT_FOUND`, `VALIDATION_ERROR`）による分岐で、適切なエラーメッセージを表示できます。

### アクセシビリティへの配慮

- WAI-ARIA: `role="search"`, `aria-label`, `aria-current="page"` など
- セマンティックHTML: 適切な見出し階層、リスト構造、time要素の使用
- フォーカス管理: キーボードナビゲーション対応

### レスポンシブデザインとダークモード対応

Tailwind CSS の CSS 変数を活用したカラーシステムにより、システムのダークモード設定に自動追従します。また、モバイルファーストのレスポンシブレイアウトで、様々なデバイスサイズに対応しています。

### テスタビリティを考慮した設計

Vitest と Testing Library を用いた包括的なテストスイートを実装しました。モックを活用した API クライアントのテスト、ユーザーイベントシミュレーションによるコンポーネントテストなど、84 件のユニットテストケースでコードの品質を担保しています。

さらに、Playwright を用いた E2E テストも実装しており、実際のブラウザ環境での検索フロー、リポジトリ詳細ページ遷移、キーボードナビゲーションなどを検証しています。

## 多言語対応

デフォルトは日本語です。英語で表示するには、URL に `?lang=en` を追加します：

- 日本語: `http://localhost:3000/search`
- 英語: `http://localhost:3000/search?lang=en`

## 既知の制限事項

- **検索結果の上限**: GitHub Search API は最大 1,000 件（約 34 ページ）までの結果しか返しません
- **レート制限**:
  - 認証なし: 60 リクエスト/時間
  - 認証あり: 5,000 リクエスト/時間
- **キャッシュ**: 検索結果は 60 秒、リポジトリ詳細は 300 秒のキャッシュが設定されています
