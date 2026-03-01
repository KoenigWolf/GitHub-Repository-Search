export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

export interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

export function ok<T>(data: T): Success<T> {
  return { success: true, data };
}

export function err<E>(error: E): Failure<E> {
  return { success: false, error };
}

export const Result = {
  map<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
    if (result.success) {
      return ok(fn(result.data));
    }
    return result;
  },

  async mapAsync<T, U, E>(
    result: Result<T, E>,
    fn: (data: T) => Promise<U>
  ): Promise<Result<U, E>> {
    if (result.success) {
      try {
        return ok(await fn(result.data));
      } catch (error) {
        return err(error as E);
      }
    }
    return result;
  },

  flatMap<T, U, E>(
    result: Result<T, E>,
    fn: (data: T) => Result<U, E>
  ): Result<U, E> {
    if (result.success) {
      return fn(result.data);
    }
    return result;
  },

  mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
    if (!result.success) {
      return err(fn(result.error));
    }
    return result;
  },

  unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    if (result.success) {
      return result.data;
    }
    return defaultValue;
  },

  unwrap<T, E>(result: Result<T, E>): T {
    if (result.success) {
      return result.data;
    }
    throw result.error;
  },

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
