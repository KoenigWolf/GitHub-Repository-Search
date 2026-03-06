# Design Philosophy Guide

このドキュメントでは、GitHub Repository Search プロジェクトの設計思想を解説します。

---

## 設計原則

### 1. 型ファースト設計

**Zod スキーマを単一の情報源とする**

TypeScript の型定義と実行時バリデーションを別々に管理すると、両者の乖離が発生しやすくなります。本プロジェクトでは Zod スキーマから型を導出することで、この問題を解消しています。

**参照**: `src/lib/schemas/github.ts`

### 2. 明示的エラーハンドリング

**Result 型パターンで例外を使わない**

try-catch による例外処理は、エラーの握りつぶしやハンドリング漏れを招きやすい設計です。Result 型（`Success<T> | Failure<E>`）を採用することで、すべてのエラーパスを型システムで強制し、コード上で可視化します。

| 概念 | 説明 |
|------|------|
| `ok(data)` | 成功を表す値を生成 |
| `err(error)` | 失敗を表す値を生成 |
| `result.success` | 成功/失敗の判定に使用 |

**参照**: `src/lib/utils/result.ts`, `src/lib/api/github-client.ts`

### 3. URL ベースの状態管理

**クエリパラメータを状態の源泉とする**

検索クエリ、ページ番号、ソート順などの状態は、React の state ではなく URL のクエリパラメータで管理します。

| 利点 | 説明 |
|------|------|
| 共有可能 | URL をコピーするだけで状態を共有できる |
| 履歴対応 | ブラウザの戻る/進むボタンが自然に動作する |
| SSR 親和性 | サーバーサイドでパラメータを読み取りデータ取得可能 |
| シンプル | Redux や Context が不要 |

**参照**: `src/hooks/useSearchNavigation.ts`, `src/lib/validators/`

### 4. アクセシビリティファースト

**セマンティック HTML と ARIA を最初から組み込む**

アクセシビリティは後付けではなく、設計段階から組み込みます。適切な HTML 要素の選択（`nav`, `article`, `time` など）と ARIA 属性の付与により、スクリーンリーダーやキーボード操作に対応します。

**参照**: `src/components/common/Pagination.tsx`, `src/components/repository/RepositoryCard.tsx`

---

## コンポーネント設計

### Server Components と Client Components の分離

Next.js App Router の規約に従い、コンポーネントを責務で明確に分離します。

| 種類 | 責務 | 例 |
|------|------|-----|
| Server Component | データフェッチ、初期レンダリング | ページ、RepositoryList |
| Client Component | ユーザー操作、ブラウザ API | SearchForm, Pagination |

**原則**: Server Component から Client Component へは props で初期値を渡す。Client Component 内で URL パラメータを直接読み取って初期化すると、ハイドレーションミスマッチが発生します。

### メモ化の方針

`React.memo` は以下の条件を満たすコンポーネントに適用します：

- リスト内で繰り返しレンダリングされる（RepositoryCard）
- 親の再レンダリング頻度が高い
- レンダリングコストが高い

過剰なメモ化は避け、パフォーマンス問題が実測された箇所にのみ適用します。

---

## エラーハンドリング戦略

### エラーコード体系

GitHub API との通信で発生しうるエラーを 6 種類に分類し、それぞれに対応する i18n メッセージキーを定義しています。

| コード | 発生条件 | ユーザーへの対応 |
|--------|----------|------------------|
| `NETWORK_ERROR` | ネットワーク障害・タイムアウト | 再試行を促す |
| `RATE_LIMIT` | API レート制限超過 | 待機時間を案内 |
| `INVALID_QUERY` | 無効な検索クエリ | クエリ修正を促す |
| `NOT_FOUND` | リソースが存在しない | 404 表示 |
| `VALIDATION_ERROR` | レスポンス形式不正 | 一般エラー表示 |
| `UNKNOWN_ERROR` | その他 | 一般エラー表示 |

**参照**: `src/lib/api/github-client.ts`

### リトライ戦略

ネットワークエラーや一時的な障害には、指数バックオフ + ジッターでリトライします。

- 最大リトライ回数: 3
- 初回待機: 1秒、最大待機: 10秒
- 全体タイムアウト: 30秒
- リトライ対象: ステータス 429, 502, 503, 504 およびネットワークエラー

---

## 型安全性

### TypeScript 設定方針

| オプション | 理由 |
|------------|------|
| `strict: true` | 基本的な型安全性を確保 |
| `noUncheckedIndexedAccess` | 配列・オブジェクトアクセスで `undefined` を考慮 |
| `exactOptionalPropertyTypes` | `undefined` と「プロパティなし」を区別 |

### API レスポンス検証

外部 API のレスポンスは信頼せず、Zod スキーマで検証します。検証失敗時は `VALIDATION_ERROR` として処理し、型安全なデータのみをアプリケーション内部に流通させます。

### 環境変数

`process.env` の値も Zod で検証し、型安全なアクセスを提供します。テスト環境ではキャッシュを無効化し、テスト間で環境変数を変更できるようにしています。

**参照**: `src/lib/env.ts`

### null / undefined の扱い

**暗黙処理せず、妥当性を判断する**

null/undefined は「有効な状態」か「前提違反」かを明確に区別し、型シグネチャで意図を表明します。

| 分類 | 意味 | 型シグネチャ | 処理責任 |
|------|------|--------------|----------|
| 有効な状態 | 値がないことに意味がある | `string \| null \| undefined` | 関数内でデフォルト値を返す |
| 前提違反 | 呼び出し側のバグ | `string` | 呼び出し側がフォールバックを提供 |

**有効な状態の例:**

| 関数/フィールド | 理由 |
|-----------------|------|
| `normalizeSortParam(value: string \| null \| undefined)` | パラメータ未指定は「デフォルトソート」を意味 |
| `isValidReturnPath(path: string \| null \| undefined)` | パス未指定は「戻り先なし」を意味 |
| `repository.description: string \| null` | GitHub API が null を返す（説明なし） |
| `env.GITHUB_TOKEN: string \| undefined` | トークン未設定は許容される運用形態 |

**前提違反の例:**

| 関数 | 理由 | 呼び出し側の責任 |
|------|------|------------------|
| `normalizeQuery(query: string)` | 空文字は許容するが undefined は想定外 | `normalizeParam(params.q) ?? ""` |
| `normalizePageNumber(pageStr: string)` | 文字列として受け取る前提 | `normalizeParam(params.page) ?? "1"` |

**判断基準:**

1. **外部入力（API レスポンス、URL パラメータ）**: null/undefined は有効な状態として扱う
2. **内部関数間の受け渡し**: 前提違反として扱い、呼び出し側でフォールバック
3. **オプショナル Props**: デフォルト値を destructuring で提供

**exactOptionalPropertyTypes との関係:**

`exactOptionalPropertyTypes: true` が有効なため、Props の型定義では `?` と `| undefined` の意味が異なります。

| 型定義 | 許容する呼び出し |
|--------|-----------------|
| `prop?: string` | `{}` または `{ prop: "value" }` |
| `prop?: string \| undefined` | `{}` または `{ prop: "value" }` または `{ prop: undefined }` |

呼び出し側が `{ digest: error.digest }` のように `undefined` を明示的に渡す場合、受け取り側は `digest?: string | undefined` と宣言する必要があります。

**参照**: `src/lib/validators/`

---

## 国際化（i18n）

### 設計方針

外部ライブラリを使わず、軽量な独自実装で多言語対応を実現しています。

| 項目 | 内容 |
|------|------|
| 対応言語 | 日本語（デフォルト）、英語 |
| 切り替え方法 | URL パラメータ `?lang=en` |
| 型安全性 | `MessageKeys` 型で全言語のキー一致を強制 |

### フォーマット

数値・日付のフォーマットには `Intl` API を使用し、ロケールに応じた表示を行います。フォーマッターはキャッシュして再利用し、生成コストを削減しています。

**参照**: `src/lib/i18n/`, `src/lib/utils/format.ts`

---

## アクセシビリティ

### 実装方針

| 要素 | アプローチ |
|------|------------|
| フォーム | `role="search"`, `aria-label` で目的を明示 |
| ページネーション | `aria-current="page"` で現在ページを示す |
| エラー表示 | `role="alert"` でスクリーンリーダーに通知 |
| 省略記号 | `role="separator"` で装飾ではなく区切りと明示 |
| 日時 | `<time>` 要素と `dateTime` 属性で機械可読に |
| スキップリンク | キーボードユーザーがナビゲーションを飛ばせる |

### テスト

vitest-axe を使用し、コンポーネント単位で WCAG 違反を自動検出します。

**参照**: `src/test/accessibility.test.tsx`

---

## パフォーマンス

### 最適化手法

| 手法 | 効果 |
|------|------|
| Suspense | データ取得中もスケルトン UI を表示し、体感速度向上 |
| Server Components | クライアント JS バンドルサイズ削減 |
| `React.memo` | 不要な再レンダリング防止 |
| フォーマッターキャッシュ | `Intl.DateTimeFormat` 生成コスト削減 |
| Next.js ISR | 検索結果 60秒、詳細ページ 300秒のキャッシュ |
| `tailwind-merge` | CSS クラスの重複を適切に解決 |

---

## テスト戦略

### テストピラミッド

| レイヤー | 対象 | ツール |
|----------|------|--------|
| ユニット | 純粋関数（validators, utils） | Vitest |
| コンポーネント | UI コンポーネントの振る舞い | Testing Library |
| アクセシビリティ | WCAG 準拠 | vitest-axe |
| E2E | ユーザーフロー全体 | Playwright |

### テスト方針

- **純粋関数を優先**: ロジックを純粋関数に抽出し、テストしやすくする
- **ユーザー視点**: 実装詳細ではなく、ユーザーが見る振る舞いをテスト
- **モック最小化**: 外部依存（Next.js Router など）のみモック

**参照**: `src/test/`

---

## セキュリティ

### 対策一覧

| 脅威 | 対策 |
|------|------|
| XSS | Content Security Policy (CSP) |
| オープンリダイレクト | `isValidReturnPath` によるパス検証 |
| DoS | ミドルウェアでのレート制限 |
| 機密情報漏洩 | 環境変数のサーバーサイド限定 |

**参照**: `next.config.mjs`, `src/lib/validators/path.ts`, `src/middleware.ts`

---

## ディレクトリ構成

```text
src/
├── app/                    # ページ（Server Components）
├── components/
│   ├── common/             # 共通（ErrorPanel, Pagination）
│   ├── repository/         # リポジトリ関連
│   ├── search/             # 検索関連
│   └── ui/                 # プリミティブ UI
├── hooks/                  # カスタムフック
├── lib/
│   ├── api/                # 外部 API クライアント
│   ├── i18n/               # 国際化
│   ├── schemas/            # Zod スキーマ
│   ├── utils/              # ユーティリティ
│   └── validators/         # 入力値検証
└── test/                   # テスト
```

外部から参照される公開モジュール（`components/*`, `hooks`, `lib/utils` など）には `index.ts`（バレルエクスポート）を配置します。単一ファイルのみのディレクトリや内部実装（`test/`, `lib/api/`）には不要です。

---

## まとめ

| 原則 | 要約 |
|------|------|
| 型ファースト | Zod スキーマから型を導出し、実行時と型の整合性を保証 |
| 明示的エラー | Result 型で例外を使わず、エラーパスを可視化 |
| null/undefined | 有効な状態か前提違反かを型で明示し、暗黙処理しない |
| URL 状態管理 | 共有可能・履歴対応・SSR 親和性を実現 |
| アクセシビリティ | 設計段階から組み込み、自動テストで担保 |
| パフォーマンス | Suspense・キャッシュ・メモ化で体感速度向上 |
| セキュリティ | CSP・入力検証・レート制限でデフォルト保護 |
