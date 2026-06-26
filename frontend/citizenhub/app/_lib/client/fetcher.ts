import { z, ZodError } from 'zod';
import { redirect } from 'next/navigation';
import { asyncOrRecover } from 'udp-ui/fp';

export type PartialResponse = {
  url: string;
  status: number;
  statusText: string;
  text: () => Promise<string>;
};

export class FetchError extends Error {
  public readonly status: number;
  private readonly description: Promise<string>;

  constructor(res: PartialResponse) {
    super(
      JSON.stringify({
        url: res.url,
        status: res.status,
        statusText: res.statusText,
      }),
    );
    this.status = res.status;
    this.description = res.text();
  }

  async log() {
    console.log(this.message, await this.description);
  }
}

/**
 * Construct a fetcher that parses the response as a zod type
 * @param zType - The zod type to parse the response as, defaults to `void`
 * @returns A fetch function that returns a promise of the parsed response
 */
export const fetcher: <Z extends z.ZodTypeAny>(
  zType: Z,
) => (...args: Parameters<typeof fetch>) => Promise<z.infer<Z>> =
  (zType) =>
  (url, ...args) =>
    fetch(url, ...args)
      .then(throwOnError)
      .then((res) => res.json())
      .then((data) => zType.parse(data) as z.infer<typeof zType>)
      .catch(handleFetchErrors(url));

/**
 * Construct a fetcher that throws on error or returns the raw response
 */
export const fetcherRaw: (
  ...args: Parameters<typeof fetch>
) => Promise<Response> = (url, ...args) =>
  fetch(url, ...args)
    .then(throwOnError)
    .catch(handleFetchErrors(url));

export type ParsedResponse<T> = {
  data?: T;
  error?: FetchError;
};

/**
 * Try fetching the data and construct a parsed response.
 */
export const asyncMkParsedResponse = <R>(fetchFunc: () => Promise<R>) =>
  asyncOrRecover(
    mkParsedResponseError<R>,
    mkParsedResponseSuccess<R>,
  )(fetchFunc);

/**
 * Log a custom message and throw the error
 * @example
 * await fetcher(zType)(...)
 *   .catch(logMessage('Error refreshing access_token'));
 * @param msg
 */
export const logMessage = (msg: string) => (error: unknown) => {
  console.error(msg);
  throw error;
};

const throwOnError: (res: Response) => Response = (res) => {
  if (res.ok) return res;
  if (res.status === 401) {
    redirect('/api/auth/signin');
  } else {
    throw new FetchError(res);
  }
};

const handleFetchErrors: (
  url: Parameters<typeof fetch>[0],
) => (e: Error) => Promise<Response> = (url) => async (e) => {
  if (e instanceof ZodError) {
    console.error(e, url, e.errors);
  } else if (e instanceof FetchError) {
    await e.log();
  } else {
    console.error(e);
  }
  throw e;
};

const mkParsedResponseError: <R>(e: unknown) => ParsedResponse<R> = (
  e: unknown,
) => {
  if (e instanceof FetchError) return { error: e };
  else throw e;
};

const mkParsedResponseSuccess: <R>(r: R) => ParsedResponse<R> = (r) => ({
  data: r,
});
