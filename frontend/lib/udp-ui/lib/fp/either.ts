/* v8 ignore start */
/* This simplified Either is mainly typing so no need for tests. */

/* Represents a failure with a value of type E. */
export interface Left<E> {
  readonly left: E;
  readonly _tag: 'Left';
}

/* Represents a success with a value of type A. */
export interface Right<A> {
  readonly right: A;
  readonly _tag: 'Right';
}

/* Simplified version of the Either type without all the utility functions. */
export type Either<E, A> = Left<E> | Right<A>;

/* Constructs a Left value. */
export const left: <E = never, A = never>(e: E) => Either<E, A> = (e) => ({
  left: e,
  _tag: 'Left',
});

/* Constructs a Right value. */
export const right: <E = never, A = never>(a: A) => Either<E, A> = (a) => ({
  right: a,
  _tag: 'Right',
});

/* Type guard to check if an Either is a Left. */
export const isLeft: <E>(ma: Either<E, unknown>) => ma is Left<E> = (ma) =>
  ma._tag === 'Left';

/* Type guard to check if an Either is a Right. */
export const isRight: <A>(ma: Either<unknown, A>) => ma is Right<A> = (ma) =>
  ma._tag === 'Right';
