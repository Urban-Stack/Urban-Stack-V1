import { CombinedGraphQLErrors } from '@apollo/client/errors';

type ErrorWithMessage = {
  message: string;
};

const hasMessage = (error: unknown): error is ErrorWithMessage =>
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  typeof error.message === 'string';

export const getResultErrorMessages = (
  error: unknown,
): string[] | undefined => {
  if (!error) return undefined;
  if (CombinedGraphQLErrors.is(error))
    return error.errors.map(({ message }) => message);
  if (hasMessage(error)) return [error.message];
  return undefined;
};

export const getResultGeneralErrors = (
  error: unknown,
  fallback = 'Ein unbekannter Fehler ist aufgetreten.',
): string[] => getResultErrorMessages(error) ?? [fallback];
