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

# ビルド
npm run build
```

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| GITHUB_TOKEN | 任意 | GitHub Personal Access Token。設定するとレート制限が 60 req/h から 5,000 req/h に緩和されます。 |

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **テスト**: Vitest, Testing Library
- **ユーティリティ**: clsx, tailwind-merge

## アーキテクチャ

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # ルートレイアウト（ヘッダー含む）
│   ├── page.tsx                 # ルートページ（/search にリダイレクト）
│   ├── not-found.tsx            # 404 ページ
│   ├── globals.css              # グローバルスタイル・CSS 変数
│   ├── search/
│   │   └── page.tsx             # 検索ページ（Server Component）
│   └── repositories/[owner]/[repo]/
│       └── page.tsx             # リポジトリ詳細ページ
├── components/
│   ├── ui/                      # 汎用 UI コンポーネント
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   └── select.tsx
│   ├── SearchForm.tsx           # 検索フォーム（Client Component）
│   ├── RepositoryCard.tsx       # リポジトリカード
│   ├── RepositoryList.tsx       # リポジトリ一覧
│   ├── Pagination.tsx           # ページネーション（Client Component）
│   ├── Skeleton.tsx             # ローディングスケルトン
│   └── ErrorDisplay.tsx         # エラー表示
├── lib/
│   ├── github.ts                # GitHub API クライアント
│   └── utils.ts                 # ユーティリティ関数
├── types/
│   └── github.ts                # 型定義
└── test/
    ├── setup.ts                 # テストセットアップ
    ├── fixtures.ts              # テスト用モックデータ
    ├── github.test.ts           # API クライアントテスト
    ├── utils.test.ts            # ユーティリティテスト
    ├── RepositoryCard.test.tsx  # コンポーネントテスト
    ├── SearchForm.test.tsx
    └── Pagination.test.tsx
```

## 工夫した点・拘りポイント

### Server Components と Client Components の適切な分離

Next.js 14 の App Router を活用し、データフェッチが必要なコンポーネント（RepositoryList, RepositoryCard など）は Server Component として実装しました。一方、ユーザーインタラクションが必要な SearchForm や Pagination は Client Component として分離しています。これにより、初期ロード時の JavaScript バンドルサイズを最小化しつつ、必要な部分でのみクライアントサイドの機能を提供しています。

### 型安全な API クライアント設計

GitHub API のレスポンスに対して厳密な型定義を行い、GitHubApiError カスタムクラスを用いたエラーハンドリングを実装しました。これにより、API エラー（403 レート制限、404 Not Found、422 バリデーションエラー）を適切にハンドリングし、ユーザーフレンドリーなエラーメッセージを表示できます。

### アクセシビリティへの配慮

WAI-ARIA を活用し、role="search" によるフォームのセマンティクス、aria-label による操作説明、aria-current="page" によるページネーションの現在位置表示など、スクリーンリーダー利用者にも配慮した実装を行いました。

### レスポンシブデザインとダークモード対応

Tailwind CSS の CSS 変数を活用したカラーシステムにより、システムのダークモード設定に自動追従します。また、モバイルファーストのレスポンシブレイアウトで、様々なデバイスサイズに対応しています。

### テスタビリティを考慮した設計

Vitest と Testing Library を用いた包括的なテストスイートを実装しました。モックを活用した API クライアントのテスト、ユーザーイベントシミュレーションによるコンポーネントテストなど、46 件のテストケースでコードの品質を担保しています。

## AI 利用レポート

本プロジェクトは Claude Code を活用して開発されました。

### 利用したプロンプトと生成内容

1. **プロジェクト初期化**: Next.js 14 + TypeScript + Tailwind CSS + Vitest のセットアップ、設定ファイルの生成
2. **型定義・API クライアント**: GitHub API のレスポンス型、searchRepositories/getRepository 関数、エラーハンドリングクラスの生成
3. **UI コンポーネント**: Button, Input, Badge, Select の forwardRef パターンでの実装、Tailwind CSS 変数システムの構築
4. **検索ページ**: SearchForm, RepositoryCard, RepositoryList, Pagination, Skeleton, ErrorDisplay の実装
5. **詳細ページ**: リポジトリ詳細ページ、404 ページ、レイアウトコンポーネントの生成
6. **テストコード**: 各コンポーネント・関数のテストケース生成
7. **仕上げ**: ビルドエラー・リントエラー・テスト失敗の修正

### レビュー・修正した箇所

- ESLint エラー: 空のインターフェース定義を type エイリアスに修正
- テスト: 検索ボタンの正規表現パターンを `/検索/` から `/^検索$/` に修正（クリアボタンとの衝突回避）
- テスト: getRepository の 404 エラーテストでモックが消費済みになる問題を修正

## 既知の制限事項

- **検索結果の上限**: GitHub Search API は最大 1,000 件（約 34 ページ）までの結果しか返しません
- **レート制限**:
  - 認証なし: 60 リクエスト/時間
  - 認証あり: 5,000 リクエスト/時間
- **キャッシュ**: 検索結果は 60 秒、リポジトリ詳細は 300 秒のキャッシュが設定されています
