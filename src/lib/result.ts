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
