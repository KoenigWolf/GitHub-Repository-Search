/**
 * Result型パターン - 関数型プログラミングスタイルのエラーハンドリング
 *
 * 例外をスローする代わりに、成功または失敗を表す型を返す
 * これにより型安全なエラーハンドリングが可能になる
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

export interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

/**
 * 成功結果を作成
 */
export function ok<T>(data: T): Success<T> {
  return { success: true, data };
}

/**
 * 失敗結果を作成
 */
export function err<E>(error: E): Failure<E> {
  return { success: false, error };
}

/**
 * Result型のユーティリティ関数
 */
export const Result = {
  /**
   * 成功の場合のみ関数を適用
   */
  map<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
    if (result.success) {
      return ok(fn(result.data));
    }
    return result;
  },

  /**
   * 成功の場合のみ非同期関数を適用
   */
  async mapAsync<T, U, E>(
    result: Result<T, E>,
    fn: (data: T) => Promise<U>
  ): Promise<Result<U, E>> {
    if (result.success) {
      return ok(await fn(result.data));
    }
    return result;
  },

  /**
   * 成功の場合のみResult返す関数を適用（flatMap）
   */
  flatMap<T, U, E>(
    result: Result<T, E>,
    fn: (data: T) => Result<U, E>
  ): Result<U, E> {
    if (result.success) {
      return fn(result.data);
    }
    return result;
  },

  /**
   * 失敗の場合のみ関数を適用
   */
  mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
    if (!result.success) {
      return err(fn(result.error));
    }
    return result;
  },

  /**
   * デフォルト値を返す
   */
  unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    if (result.success) {
      return result.data;
    }
    return defaultValue;
  },

  /**
   * 成功の場合は値を返し、失敗の場合は例外をスロー
   */
  unwrap<T, E>(result: Result<T, E>): T {
    if (result.success) {
      return result.data;
    }
    throw result.error;
  },

  /**
   * Promise<Result>からResultを作成
   */
  async fromPromise<T, E = Error>(
    promise: Promise<T>,
    errorMapper?: (error: unknown) => E
  ): Promise<Result<T, E>> {
    try {
      const data = await promise;
      return ok(data);
    } catch (error) {
      if (errorMapper) {
        return err(errorMapper(error));
      }
      return err(error as E);
    }
  },

  /**
   * 複数のResultを結合
   */
  combine<T extends readonly Result<unknown, unknown>[]>(
    results: T
  ): Result<
    { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
    T[number] extends Result<unknown, infer E> ? E : never
  > {
    const data: unknown[] = [];
    for (const result of results) {
      if (!result.success) {
        return result as Failure<T[number] extends Result<unknown, infer E> ? E : never>;
      }
      data.push(result.data);
    }
    return ok(data) as Success<{
      [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never;
    }>;
  },
} as const;
